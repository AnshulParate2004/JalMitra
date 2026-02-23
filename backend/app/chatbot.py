"""
Simple chatbot module for water quality recommendations using LangChain and Azure OpenAI.
Streams recommendations based on current water quality data.
"""
import os
from typing import List, Dict, Any, Optional, AsyncGenerator
from langchain_openai import AzureChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

# Global memory storage (simple in-memory for now)
_chat_memories: Dict[str, List] = {}

# Water quality recommendations knowledge base
WATER_QUALITY_KNOWLEDGE = """
Water Quality Recommendations:

1. pH Level Issues:
   - If pH < 6.0 (Acidic): Add alkaline substances like baking soda or lime. Install pH correction filters. Check for industrial contamination sources.
   - If pH > 9.0 (Alkaline): Add acidic substances like citric acid or vinegar. Install reverse osmosis system. Check for soap or detergent contamination.

2. High TDS (Total Dissolved Solids):
   - Install reverse osmosis (RO) system
   - Use activated carbon filters
   - Consider distillation for very high TDS
   - Check for salt intrusion or mineral contamination
   - Regular filter maintenance is essential

3. High Turbidity:
   - Install sediment filters
   - Use coagulation and flocculation treatment
   - Consider sand filtration systems
   - Check for source contamination
   - Regular cleaning of storage tanks

4. General Water Quality Improvement:
   - Regular testing and monitoring
   - Proper storage in clean containers
   - Boiling water for consumption
   - Use of water purifiers
   - Regular maintenance of water treatment systems
   - Avoid storing water in direct sunlight
   - Replace filters as per manufacturer recommendations

5. Emergency Actions:
   - If water quality is severely compromised, stop consumption immediately
   - Use bottled water as temporary solution
   - Contact local water authority
   - Boil water before use if contamination is suspected
   - Install emergency filtration systems
"""


def get_llm(streaming: bool = False):
    """Initialize and return the Azure OpenAI LLM for streaming."""
    azure_openai_endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")
    azure_openai_api_key = os.environ.get("AZURE_OPENAI_API_KEY")
    azure_openai_deployment = os.environ.get("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
    api_version = os.environ.get("OPENAI_API_VERSION", "2024-12-01-preview")

    if not azure_openai_endpoint or not azure_openai_api_key:
        raise ValueError("Azure OpenAI credentials not configured. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY in .env file.")

    return AzureChatOpenAI(
        azure_endpoint=azure_openai_endpoint,
        azure_deployment=azure_openai_deployment,
        openai_api_version=api_version,
        openai_api_key=azure_openai_api_key,
        temperature=0.7,
        streaming=streaming,
    )


def format_alerts_context(alerts: List[Dict[str, Any]]) -> str:
    """Format alerts into context string for the chatbot."""
    if not alerts:
        return "No recent alerts. Water quality is within safe parameters."

    context_parts = []
    for alert in alerts[:5]:  # Use top 5 most recent alerts
        message = alert.get("message", "")
        timestamp = alert.get("timestamp", "")
        device_id = alert.get("device_id", "")
        
        # Extract parameter values from alert message or readings
        readings = alert.get("readings", {})
        ph = readings.get("ph") if readings else None
        turbidity = readings.get("turbidity") if readings else None
        tds = readings.get("tds") if readings else None

        alert_info = f"Alert: {message}"
        if device_id:
            alert_info += f" (Device: {device_id})"
        if timestamp:
            alert_info += f" (Time: {timestamp})"
        if ph is not None:
            alert_info += f" | pH: {ph:.2f}"
        if turbidity is not None:
            alert_info += f" | Turbidity: {turbidity:.1f} NTU"
        if tds is not None:
            alert_info += f" | TDS: {tds:.0f} ppm"

        context_parts.append(alert_info)

    return "\n".join(context_parts)


def _get_latest_reading_data():
    """Get the latest water quality reading directly."""
    try:
        from app.main import _get_latest
        reading = _get_latest(None)
        return reading
    except Exception as e:
        print(f"[CHATBOT] Error fetching latest reading: {e}")
        return None


def _get_recent_alerts_data(limit: int = 5):
    """Get recent alerts directly."""
    try:
        from app.main import _get_alerts
        alerts = _get_alerts(limit)
        return alerts
    except Exception as e:
        print(f"[CHATBOT] Error fetching alerts: {e}")
        return []


async def get_chatbot_response_stream(user_message: str, alerts: List[Dict[str, Any]] = None, session_id: str = "default") -> AsyncGenerator[str, None]:
    """
    Get streaming response from chatbot with simple recommendations.
    
    Yields:
        str: Chunks of the response text
    """
    try:
        # Get conversation history for this session
        if session_id not in _chat_memories:
            _chat_memories[session_id] = []
        
        # Always fetch latest reading and alerts for context
        latest_reading = _get_latest_reading_data()
        recent_alerts = _get_recent_alerts_data(5)
        
        # Build water quality context
        water_context = ""
        if latest_reading:
            ph = latest_reading.get("ph")
            tds = latest_reading.get("tds")
            turbidity = latest_reading.get("turbidity")
            
            water_context = f"\n\nCurrent Water Quality:\n"
            water_context += f"pH: {ph:.2f} (Safe range: 6.0-9.0)\n"
            water_context += f"TDS: {tds:.0f} ppm (Safe: <500 ppm)\n"
            water_context += f"Turbidity: {turbidity:.1f} NTU (Safe: <100 NTU)\n"
            
            # Identify issues
            issues = []
            if ph < 6.0:
                issues.append(f"pH is too acidic ({ph:.2f})")
            elif ph > 9.0:
                issues.append(f"pH is too alkaline ({ph:.2f})")
            if tds > 500:
                issues.append(f"TDS is too high ({tds:.0f} ppm)")
            if turbidity > 100:
                issues.append(f"Turbidity is too high ({turbidity:.1f} NTU)")
            
            if issues:
                water_context += f"\n⚠️ Issues Detected: {', '.join(issues)}\n"
            else:
                water_context += f"\n✅ All parameters are within safe ranges.\n"
        
        # Format alerts context
        alerts_context = format_alerts_context(recent_alerts or alerts or [])
        
        # Build system prompt
        system_prompt = f"""You are a simple and helpful water quality assistant for JalSuraksha.
Your job is to provide clear, actionable recommendations when water quality is bad.

Knowledge Base:
{WATER_QUALITY_KNOWLEDGE}

{water_context}

Recent Alerts:
{alerts_context}

Guidelines:
- Be concise and practical
- Focus on what to do if water is bad
- Provide step-by-step recommendations
- Use simple language
- Prioritize safety
- If water quality is good, acknowledge it briefly
- Always use proper spacing and punctuation in your responses"""
        
        # Build messages list
        try:
            llm = get_llm(streaming=True)
        except Exception as e:
            yield f"Configuration error: {str(e)}. Please check your Azure OpenAI settings in .env file."
            return
            
        messages = [SystemMessage(content=system_prompt)]
        
        # Add conversation history (last 5 messages to keep it simple)
        for msg in _chat_memories[session_id][-5:]:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))
        
        # Add current user message
        messages.append(HumanMessage(content=user_message))
        
        # Stream response - use non-streaming to avoid spacing issues
        # Then stream the complete response character by character for UX
        full_response = ""
        
        try:
            # Get full response first (non-streaming) to ensure proper spacing
            llm_sync = get_llm(streaming=False)
            response = llm_sync.invoke(messages)
            
            if hasattr(response, 'content'):
                full_response = response.content
            elif hasattr(response, 'text'):
                full_response = response.text
            else:
                full_response = str(response)
            
            # Stream the complete response in chunks for better UX
            chunk_size = 5  # Stream 5 characters at a time
            for i in range(0, len(full_response), chunk_size):
                chunk = full_response[i:i + chunk_size]
                yield chunk
                # Small delay for smooth streaming effect
                import asyncio
                await asyncio.sleep(0.01)
                
        except Exception as stream_error:
            # If non-streaming fails, try streaming
            import traceback
            error_trace = traceback.format_exc()
            print(f"[CHATBOT STREAM] Error: {error_trace}")
            try:
                async for chunk in llm.astream(messages):
                    if hasattr(chunk, 'content'):
                        delta = chunk.content or ""
                    elif hasattr(chunk, 'text'):
                        delta = chunk.text or ""
                    else:
                        delta = str(chunk) if chunk else ""
                    
                    if delta:
                        full_response += delta
                        yield delta
            except Exception as e2:
                raise stream_error
                    
        except Exception as stream_error:
            import traceback
            error_trace = traceback.format_exc()
            print(f"[CHATBOT STREAM] Error during streaming: {error_trace}")
            # If streaming fails, try non-streaming as fallback
            try:
                llm_sync = get_llm(streaming=False)
                response = llm_sync.invoke(messages)
                if hasattr(response, 'content'):
                    full_response = response.content
                elif hasattr(response, 'text'):
                    full_response = response.text
                else:
                    full_response = str(response)
                yield full_response
            except Exception as e2:
                import traceback
                print(f"[CHATBOT FALLBACK] Error: {traceback.format_exc()}")
                yield f"I apologize, but I'm experiencing technical difficulties. Please check the backend logs for details."
        
        # Store in memory
        _chat_memories[session_id].append({"role": "user", "content": user_message})
        _chat_memories[session_id].append({"role": "assistant", "content": full_response})
        
        # Keep memory size manageable
        if len(_chat_memories[session_id]) > 10:
            _chat_memories[session_id] = _chat_memories[session_id][-10:]
            
    except ValueError as e:
        yield f"Configuration error: {str(e)}. Please check your Azure OpenAI settings."
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"[CHATBOT ERROR] {error_details}")
        yield f"I apologize, but I'm experiencing technical difficulties. Please try again later. Error: {str(e)}"


def get_chatbot_response(user_message: str, alerts: List[Dict[str, Any]] = None, session_id: str = "default") -> str:
    """
    Get response from chatbot (non-streaming fallback).
    
    Args:
        user_message: User's question or message
        alerts: List of recent alerts for context
        session_id: Session ID for maintaining conversation history
        
    Returns:
        Chatbot response string
    """
    try:
        llm = get_llm(streaming=False)
        
        # Get latest reading and alerts
        latest_reading = _get_latest_reading_data()
        recent_alerts = _get_recent_alerts_data(5)
        
        # Build water quality context
        water_context = ""
        if latest_reading:
            ph = latest_reading.get("ph")
            tds = latest_reading.get("tds")
            turbidity = latest_reading.get("turbidity")
            
            water_context = f"\n\nCurrent Water Quality:\n"
            water_context += f"pH: {ph:.2f} (Safe range: 6.0-9.0)\n"
            water_context += f"TDS: {tds:.0f} ppm (Safe: <500 ppm)\n"
            water_context += f"Turbidity: {turbidity:.1f} NTU (Safe: <100 NTU)\n"
            
            # Identify issues
            issues = []
            if ph < 6.0:
                issues.append(f"pH is too acidic ({ph:.2f})")
            elif ph > 9.0:
                issues.append(f"pH is too alkaline ({ph:.2f})")
            if tds > 500:
                issues.append(f"TDS is too high ({tds:.0f} ppm)")
            if turbidity > 100:
                issues.append(f"Turbidity is too high ({turbidity:.1f} NTU)")
            
            if issues:
                water_context += f"\n⚠️ Issues Detected: {', '.join(issues)}\n"
            else:
                water_context += f"\n✅ All parameters are within safe ranges.\n"
        
        # Format alerts context
        alerts_context = format_alerts_context(recent_alerts or alerts or [])
        
        # Get conversation history for this session
        if session_id not in _chat_memories:
            _chat_memories[session_id] = []
        
        # Build system prompt
        system_prompt = f"""You are a simple and helpful water quality assistant for JalSuraksha.
Your job is to provide clear, actionable recommendations when water quality is bad.

Knowledge Base:
{WATER_QUALITY_KNOWLEDGE}

{water_context}

Recent Alerts:
{alerts_context}

Guidelines:
- Be concise and practical
- Focus on what to do if water is bad
- Provide step-by-step recommendations
- Use simple language
- Prioritize safety
- If water quality is good, acknowledge it briefly
- Always use proper spacing and punctuation in your responses"""
        
        # Build messages list
        messages = [SystemMessage(content=system_prompt)]
        
        # Add conversation history
        for msg in _chat_memories[session_id][-5:]:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))
        
        # Add current user message
        messages.append(HumanMessage(content=user_message))
        
        # Get response from LLM
        response = llm.invoke(messages)
        
        # Extract response content
        if hasattr(response, 'content'):
            response_text = response.content
        else:
            response_text = str(response)
        
        # Store in memory
        _chat_memories[session_id].append({"role": "user", "content": user_message})
        _chat_memories[session_id].append({"role": "assistant", "content": response_text})
        
        # Keep memory size manageable
        if len(_chat_memories[session_id]) > 10:
            _chat_memories[session_id] = _chat_memories[session_id][-10:]
        
        return response_text
    except ValueError as e:
        return f"Configuration error: {str(e)}. Please check your Azure OpenAI settings."
    except Exception as e:
        return f"I apologize, but I'm experiencing technical difficulties. Please try again later. Error: {str(e)}"
