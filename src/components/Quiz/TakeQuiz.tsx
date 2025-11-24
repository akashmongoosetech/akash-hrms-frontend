import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import toast from 'react-hot-toast';

interface Question {
  _id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface QuizSubmission {
  question_id: string;
  selected_option: string;
}

const TakeQuiz: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuizQuestion();
  }, [quizId]);

  const fetchQuizQuestion = async () => {
    if (!quizId) return;

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/quiz/employee/quizzes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const quizzes = await response.json();
        const quiz = quizzes.find((q: any) => q._id === quizId);
        if (quiz) {
          setQuestion(quiz.question_id);
        } else {
          toast.error('Quiz not found');
          navigate('/quiz');
        }
      } else {
        toast.error('Failed to load quiz');
        navigate('/quiz');
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
      toast.error('Error loading quiz');
      navigate('/quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption || !question) {
      toast.error('Please select an answer');
      return;
    }

    setSubmitting(true);
    try {
      const submission: QuizSubmission = {
        question_id: question._id,
        selected_option: selectedOption
      };

      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/quiz/employee/submit-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ answers: [submission] })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Quiz submitted! Score: ${result.score}/${result.total}`);
        navigate('/quiz');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to submit quiz');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      toast.error('Error submitting quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 rounded mb-4"></div>
          <div className="bg-gray-200 h-32 rounded mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="bg-gray-200 h-6 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="text-gray-500">Quiz not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Quiz Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-lg font-medium mb-4">{question.question_text}</p>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">Select your answer:</Label>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="A" id="option-a" />
                <Label htmlFor="option-a" className="flex-1 cursor-pointer">
                  <span className="font-medium mr-2">A.</span>
                  {question.option_a}
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="B" id="option-b" />
                <Label htmlFor="option-b" className="flex-1 cursor-pointer">
                  <span className="font-medium mr-2">B.</span>
                  {question.option_b}
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="C" id="option-c" />
                <Label htmlFor="option-c" className="flex-1 cursor-pointer">
                  <span className="font-medium mr-2">C.</span>
                  {question.option_c}
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="D" id="option-d" />
                <Label htmlFor="option-d" className="flex-1 cursor-pointer">
                  <span className="font-medium mr-2">D.</span>
                  {question.option_d}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={submitting || !selectedOption}
              className="flex-1"
            >
              {submitting ? 'Submitting...' : 'Submit Answer'}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/quiz')}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TakeQuiz;