"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function Home() {
    const [jobDescription, setJobDescription] = useState("");
    const [resume, setResume] = useState<File | null>(null);
    const [coverLetter, setCoverLetter] = useState("");
    const [loading, setLoading] = useState(false);

    const onDrop = (acceptedFiles: File[]) => {
        setResume(acceptedFiles[0]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resume || !jobDescription) {
            alert("Please provide both a resume and a job description.");
            return;
        }
        setLoading(true);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const resumeContent = event.target?.result as string;
                const prompt = `Generate a cover letter based on the following resume and job description:
                  Resume:
                  ${resumeContent}
  
                  Job Description:
                  ${jobDescription}`;
                const result = await fetch("/api/generate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ prompt }),
                }).then((res) => res.json());
                setCoverLetter(result.result);
            } catch (error) {
                console.error("Error generating cover letter:", error);
                alert(
                    "An error occurred while generating the cover letter. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };
        reader.onerror = () => {
            console.error("Error reading the resume file.");
            alert(
                "An error occurred while reading the resume file. Please try again."
            );
            setLoading(false);
        };
        reader.readAsText(resume);
    };

    return (
        <main className="min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-8">Cover Letter Generator</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="jobDescription" className="block mb-2">
                        Job Description:
                    </label>
                    <textarea
                        id="jobDescription"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="w-full p-2 border rounded text-black"
                        rows={5}
                    />
                </div>
                <div>
                    <label
                        {...getRootProps()}
                        className="block p-4 border-2 border-dashed rounded cursor-pointer"
                    >
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <p>Drop the resume here ...</p>
                        ) : (
                            <p>
                                Drag and drop your resume here, or click to
                                select file
                            </p>
                        )}
                    </label>
                    {resume && <p className="mt-2">File: {resume.name}</p>}
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    {loading ? "Generating..." : "Generate Cover Letter"}
                </button>
            </form>
            {coverLetter && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">
                        Generated Cover Letter:
                    </h2>
                    <pre className="whitespace-pre-wrap bg-white p-4 rounded text-black">
                        {coverLetter}
                    </pre>
                </div>
            )}
        </main>
    );
}
