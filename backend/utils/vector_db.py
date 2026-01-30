import chromadb
from chromadb.utils import embedding_functions
import json
import os

# Initialize components
# Ensure directory exists or let Chroma handle it
CHROMA_DATA_PATH = "backend/data/chroma_db"
client = chromadb.PersistentClient(path=CHROMA_DATA_PATH)

# Use a lightweight model for local embedding
embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

collection = client.get_or_create_collection(
    name="doj_knowledge",
    embedding_function=embedding_func
)

def initialize_db():
    print("Initializing Knowledge Base...")
    try:
        with open("backend/data/knowledge_base.json", "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Error: knowledge_base.json not found.")
        return

    documents = []
    ids = []
    metadatas = []
    
    # Process Schemes
    for scheme in data.get("schemes", []):
        doc_text = f"{scheme['name']}: {scheme['description']} Benefits: {', '.join(scheme.get('benefits', []))}"
        documents.append(doc_text)
        ids.append(f"scheme_{scheme['id']}")
        metadatas.append({"type": "scheme", "url": scheme.get("url", "")})
        
    # Process FAQs
    for i, faq in enumerate(data.get("faqs", [])):
        doc_text = f"Q: {faq['question']} A: {faq['answer']}"
        documents.append(doc_text)
        ids.append(f"faq_{i}") 
        metadatas.append({"type": "faq", "intent": faq.get("intent", "info")})
        
    # Add to collection
    if documents:
        collection.upsert(
            documents=documents,
            ids=ids,
            metadatas=metadatas
        )
    print(f"Indexed {len(documents)} documents into ChromaDB.")

def query_knowledge(query_text, n_results=2):
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results
    )
    # Format results for easier consumption
    parsed_results = []
    if results['documents']:
        for i, doc in enumerate(results['documents'][0]):
            meta = results['metadatas'][0][i]
            parsed_results.append({
                "content": doc,
                "metadata": meta
            })
    return parsed_results

if __name__ == "__main__":
    initialize_db()
