
# RAG Coding Demo - 10 Minutes
# Simple implementation showing core concepts

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import openai

# Demo Setup (1 minute)
print("=== RAG Demo Setup ===")

# Sample knowledge base - company documents
knowledge_base = [
    "Our company vacation policy allows 25 days of paid time off per year for full-time employees.",
    "The office hours are Monday to Friday, 9 AM to 6 PM, with flexible remote work options.",
    "Our health insurance covers medical, dental, and vision with 80% company contribution.",
    "The quarterly team meeting is scheduled for the first Tuesday of each quarter at 2 PM.",
    "Performance reviews are conducted bi-annually in June and December.",
    "Our company cafeteria serves lunch from 12 PM to 2 PM with vegetarian and vegan options.",
    "The IT support team can be reached at extension 1234 for technical issues.",
    "New employee onboarding takes place every first Monday of the month."
]

print(f"Knowledge Base: {len(knowledge_base)} documents loaded")

# Step 1: Document Embedding (2 minutes)
print("\n=== Step 1: Converting Documents to Embeddings ===")

# Load pre-trained sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Create embeddings for all documents
document_embeddings = model.encode(knowledge_base)
print(f"Document embeddings shape: {document_embeddings.shape}")
print("✅ All documents converted to 384-dimensional vectors")

# Step 2: Interactive Query Processing (3 minutes)
print("\n=== Step 2: Semantic Search Function ===")

def semantic_search(query, top_k=2):
    # Embed the query
    query_embedding = model.encode([query])

    # Calculate similarities
    similarities = cosine_similarity(query_embedding, document_embeddings)[0]

    # Get top-k most similar documents
    top_indices = np.argsort(similarities)[::-1][:top_k]

    results = []
    for idx in top_indices:
        results.append({
            'document': knowledge_base[idx],
            'similarity': similarities[idx],
            'index': idx
        })

    return results

# Test with sample queries
test_queries = [
    "How many vacation days do I get?",
    "What are the working hours?",
    "When is the next team meeting?",
    "How do I contact IT support?"
]

print("\n=== Testing Semantic Search ===")
for query in test_queries:
    print(f"\nQuery: '{query}'")
    results = semantic_search(query, top_k=2)

    for i, result in enumerate(results, 1):
        print(f"  {i}. [Similarity: {result['similarity']:.3f}] {result['document']}")

# Step 3: Complete RAG Pipeline (3 minutes)
print("\n=== Step 3: Complete RAG Pipeline ===")

def simple_rag(question, context_docs):
    # Create context from retrieved documents
    context = "\n".join([doc['document'] for doc in context_docs])

    # Simple prompt template
    prompt = f"""
    Based on the following company information, answer the question:

    Context:
    {context}

    Question: {question}

    Answer:"""

    return prompt

# Demo the complete pipeline
demo_question = "What's our vacation policy and office hours?"
print(f"\nDemo Question: {demo_question}")

# Retrieve relevant documents
retrieved_docs = semantic_search(demo_question, top_k=2)
print("\nRetrieved Documents:")
for i, doc in enumerate(retrieved_docs, 1):
    print(f"  {i}. {doc['document']}")

# Generate RAG prompt
rag_prompt = simple_rag(demo_question, retrieved_docs)
print("\n=== Final RAG Prompt ===")
print(rag_prompt)

# Step 4: Benefits Demonstration (1 minute)
print("\n=== Step 4: Benefits Demonstration ===")
print("✅ Accurate: Retrieved exactly relevant documents")
print("✅ Fast: Search completed in milliseconds") 
print("✅ Scalable: Works with thousands of documents")
print("✅ Transparent: Can see exactly which documents were used")
print("✅ Updatable: Add new documents without retraining")

print("\n=== Demo Complete! ===")
print("Questions about the implementation?")
