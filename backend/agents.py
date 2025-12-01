import os
from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool

# --- 1. SETUP TOOLS ---
search_tool = SerperDevTool()

class NitiAgents:
    def __init__(self):
        # Model Selection Logic (Wahi purana smart logic)
        if "GROQ_API_KEY" in os.environ:
            print("🔵 Using Groq (Llama 3.3)")
            self.model_name = "groq/llama-3.3-70b-versatile"
        elif "GOOGLE_API_KEY" in os.environ:
            print("🟡 Using Gemini")
            self.model_name = "gemini/gemini-1.5-flash"
        else:
            raise ValueError("❌ API Keys missing in .env")

    # --- AGENT 1: THE RESEARCHER (Internet Surfer) ---
    def government_researcher(self):
        return Agent(
            role='Senior Government Policy Researcher',
            goal='Find the most accurate, latest, and official schemes for: {topic}',
            backstory="""You are an expert researcher for the Government of India. 
            Your job is to search the internet and find EXACT and REAL government schemes.
            You do NOT invent information. You only report what you find on official websites (.gov.in).
            Always look for: Eligibility, Benefits, and Official Application Links.""",
            verbose=True,
            memory=True,
            tools=[search_tool], # <-- Internet Power
            llm=self.model_name
        )

    # --- AGENT 2: THE WRITER (Formatter & Translator) ---
    def content_writer(self):
        return Agent(
            role='Public Information Officer (Sewak)',
            goal='Format the research into a clean, simple answer in the User\'s Language.',
            backstory="""You are a helpful government assistant 'Niti.ai'.
            Your rule is: "Jo user ne manga, wahi pehle do".
            
            STRICT RULES FOR OUTPUT:
            1. Language: If query is Hindi -> Reply in Hindi. If English -> Reply in English.
            2. Formatting: Use **Bold** for Scheme Names. Use Bullet points for benefits.
            3. Links: You MUST provide the direct 'Official Website Link' for every scheme.
            4. Length: Keep it short (max 150 words per scheme).
            5. Structure:
               - Scheme Name (Bold)
               - One line summary
               - Key Benefits (Bullets)
               - Official Link: [URL]
            """,
            verbose=True,
            llm=self.model_name
        )

def get_scheme_plan(user_input):
    agents = NitiAgents()
    
    # Initialize Agents
    researcher = agents.government_researcher()
    writer = agents.content_writer()

    # --- TASK 1: SEARCH ---
    task1 = Task(
        description=f"""
        Search for the latest Indian Government schemes related to: '{user_input}'.
        Focus on finding official eligibility criteria, benefits, and application links.
        Verify that the schemes are currently active in 2024-25.
        """,
        agent=researcher,
        expected_output="A list of real schemes with details and links."
    )

    # --- TASK 2: FORMAT & REPLY ---
    task2 = Task(
        description=f"""
        Using the research, write a final reply to the user.
        The user asked: '{user_input}'.
        
        If the user asked about 'Farmers', put Farmer schemes FIRST.
        If the user asked about 'Students', put Student schemes FIRST.
        
        End the message with a polite closing: "Kya aap kisi aur scheme ke baare mein jaanna chahenge?"
        """,
        agent=writer,
        context=[task1], # <-- Pichle task ka data lega
        expected_output="A well-formatted, polite response in the user's language."
    )

    # --- CREW EXECUTION ---
    crew = Crew(
        agents=[researcher, writer],
        tasks=[task1, task2],
        verbose=True,
        process=Process.sequential
    )

    return crew.kickoff()