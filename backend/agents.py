import os
from crewai import Agent, Task, Crew, Process


class NitiAgents:
    def __init__(self):
        # 🧠 SMART MODEL SELECTOR (String Based)
        # Hum check karenge ki kaunsi key available hai aur waisa model name set karenge
        
        if "GROQ_API_KEY" in os.environ:
            print("🔵 Selected Model: Groq (Llama 3.3)")
            # CrewAI ko batane ke liye ki Groq use karna hai, hum 'groq/' prefix lagate hain
            self.model_name = "groq/llama-3.3-70b-versatile"
        
        elif "GOOGLE_API_KEY" in os.environ:
            print("🟡 Selected Model: Google Gemini")
            # Gemini ke liye 'gemini/' prefix
            self.model_name = "gemini/gemini-1.5-flash"
        
        else:
            raise ValueError("❌ Koi API Key nahi mili! .env file check karo.")

    def education_expert(self):
        return Agent(
            role='Education Policy Expert',
            goal='Find scholarship and loan schemes for students',
            backstory='You are a government counselor dedicated to helping students fund their education.',
            verbose=True,
            llm=self.model_name  # <-- Ab hum String pass kar rahe hain
        )

    def agriculture_expert(self):
        return Agent(
            role='Kisan Mitra (Farmer Advisor)',
            goal='Find subsidies, insurance, and loan schemes for farmers',
            backstory='You represent the Ministry of Agriculture and help farmers understand benefits.',
            verbose=True,
            llm=self.model_name
        )

    def coordinator(self):
        return Agent(
            role='Niti.ai Guide',
            goal='Synthesize information and reply in simple Hinglish',
            backstory='You are a friendly assistant who explains complex policies in simple language.',
            verbose=True,
            llm=self.model_name
        )

def get_scheme_plan(user_input):
    agents = NitiAgents()
    
    # 1. Define Agents
    edu = agents.education_expert()
    agri = agents.agriculture_expert()
    coord = agents.coordinator()

    # 2. Define Tasks
    task1 = Task(
        description=f"Analyze input: '{user_input}'. If it relates to students, list 2 real Indian Govt schemes with benefits.",
        agent=edu,
        expected_output="List of education schemes"
    )
    
    task2 = Task(
        description=f"Analyze input: '{user_input}'. If it relates to farmers, list 2 real Indian Govt schemes with benefits.",
        agent=agri,
        expected_output="List of agriculture schemes"
    )

    task3 = Task(
        description="Combine findings. Write a helpful response in Hinglish (Mix of Hindi & English). Be polite.",
        agent=coord,
        context=[task1, task2],
        expected_output="Final Hinglish response"
    )

    # 3. Create Crew
    crew = Crew(
        agents=[edu, agri, coord],
        tasks=[task1, task2, task3],
        verbose=True,
        process=Process.sequential
    )

    return crew.kickoff()