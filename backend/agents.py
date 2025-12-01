import os
from crewai import Agent, Task, Crew, Process
# Google (Serper) ko hataya, DuckDuckGo lagaya
from langchain_community.tools import DuckDuckGoSearchRun

# --- 1. SETUP TOOLS (FREE & UNLIMITED) ---
search_tool = DuckDuckGoSearchRun()

class NitiAgents:
    def __init__(self):
        # Model Selection Logic
        if "GROQ_API_KEY" in os.environ:
            print("🔵 Using Groq (Llama 3.3)")
            self.model_name = "groq/llama-3.3-70b-versatile"
        elif "GOOGLE_API_KEY" in os.environ:
            print("🟡 Using Gemini")
            self.model_name = "gemini/gemini-1.5-flash"
        else:
            raise ValueError("❌ API Keys missing in .env")

    # --- AGENT 1: THE RESEARCHER ---
    def government_researcher(self):
        return Agent(
            role='Senior Government Policy Researcher',
            goal='Find the latest official Indian Government schemes for: {topic}',
            backstory="""You are an expert researcher. Your job is to search the internet 
            and find EXACT and REAL government schemes.
            Always look for: Eligibility, Benefits, and Application Links.""",
            verbose=True,
            memory=True,
            tools=[search_tool], # <-- Ab ye DuckDuckGo use karega
            llm=self.model_name
        )

    # --- AGENT 2: THE WRITER ---
    def content_writer(self):
        return Agent(
            role='Public Information Officer',
            goal='Format the research into a clean answer in the User\'s Language.',
            backstory="""You are 'Niti.ai'.
            STRICT RULES:
            1. Language: If query is Hindi -> Reply in Hindi. If English -> Reply in English.
            2. Formatting: Use **Bold** for Names. Use Bullet points.
            3. Links: Provide website links if found.
            4. Length: Keep it simple and helpful.
            """,
            verbose=True,
            llm=self.model_name
        )

def get_scheme_plan(user_input):
    agents = NitiAgents()
    researcher = agents.government_researcher()
    writer = agents.content_writer()

    task1 = Task(
        description=f"Search for latest Indian Govt schemes related to: '{user_input}'. Verify they are active.",
        agent=researcher,
        expected_output="List of schemes with details."
    )

    task2 = Task(
        description=f"Write a final reply for '{user_input}'. Use Bold and Bullets. Reply in user's language.",
        agent=writer,
        context=[task1],
        expected_output="Final formatted response."
    )

    crew = Crew(
        agents=[researcher, writer],
        tasks=[task1, task2],
        verbose=True,
        process=Process.sequential
    )

    return crew.kickoff()