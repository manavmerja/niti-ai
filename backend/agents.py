import os
from crewai import Agent, Task, Crew, Process
from langchain_community.tools import DuckDuckGoSearchRun

# --- 1. SETUP TOOLS ---
search_tool = DuckDuckGoSearchRun()

class NitiAgents:
    def __init__(self):
        if "GROQ_API_KEY" in os.environ:
            print("🔵 Using Groq (Llama 3.3)")
            self.model_name = "groq/llama-3.3-70b-versatile"
        elif "GOOGLE_API_KEY" in os.environ:
            print("🟡 Using Gemini")
            self.model_name = "gemini/gemini-1.5-flash"
        else:
            raise ValueError("❌ API Keys missing in .env")

    # --- AGENT 1: THE SMART RESEARCHER ---
    def government_researcher(self):
        return Agent(
            role='Senior Government Policy Researcher',
            goal='Analyze input: "{topic}". If it is a greeting/small talk, reply naturally. If it is a scheme query, search the internet.',
            backstory="""You are an expert researcher for the Government of India.
            
            YOUR DECISION LOGIC:
            1. **Greetings/Small Talk** (e.g., "Hi", "How are you", "Who are you"): 
               - DO NOT use the search tool.
               - Just reply with a friendly greeting and introduce yourself as Niti.ai.
            
            2. **Scheme Queries** (e.g., "Loan for farmers", "Student scholarship"):
               - USE the 'DuckDuckGoSearchRun' tool immediately.
               - Find official eligibility, benefits, and links.
            """,
            verbose=True,
            memory=True,
            tools=[search_tool], 
            llm=self.model_name
        )

    # --- AGENT 2: THE WRITER ---
    def content_writer(self):
        return Agent(
            role='Public Information Officer (Sewak)',
            goal='Format the answer kindly. If it was small talk, chat back. If it was a scheme, format it properly.',
            backstory="""You are 'Niti.ai', a helpful government assistant.
            
            RULES FOR RESPONSE:
            1. **If the Researcher sent a Greeting:** - Reply warmly. Example: "I am doing great! I am here to help you find government schemes. Ask me anything!"
            
            2. **If the Researcher sent Schemes:**
               - Language: Match user's language (Hindi/English).
               - Format: Use **Bold** for Names. Use Bullet points.
               - Links: Include official website links.
               - Tone: Professional yet helpful.
            """,
            verbose=True,
            llm=self.model_name
        )

def get_scheme_plan(user_input):
    agents = NitiAgents()
    researcher = agents.government_researcher()
    writer = agents.content_writer()

    # --- TASK 1: SMART SEARCH ---
    task1 = Task(
        description=f"""
        Analyze the user input: '{user_input}'.
        
        - IF it is just "Hi", "Hello", "How are you", "Kese ho":
          Return a polite greeting message. DO NOT SEARCH.
          
        - IF it is about a Topic/Scheme:
          Use the Search Tool to find latest details (Eligibility, Benefits, Links).
        """,
        agent=researcher,
        expected_output="Either a greeting message OR a list of schemes with details."
    )

    # --- TASK 2: REPLY ---
    task2 = Task(
        description=f"""
        Write the final reply for the user based on the researcher's findings.
        If it's a scheme, format it nicely with **Bold** and Bullets.
        If it's just a chat, be friendly.
        """,
        agent=writer,
        context=[task1],
        expected_output="Final natural response string."
    )

    crew = Crew(
        agents=[researcher, writer],
        tasks=[task1, task2],
        verbose=True,
        process=Process.sequential
    )

    return crew.kickoff()