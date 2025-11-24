import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatDate } from '../../Common/Commonfunction';
import toast from 'react-hot-toast';

interface QuizAssignment {
  _id: string;
  question_id: {
    _id: string;
    question_text: string;
    difficulty: string;
    category: string;
  };
  assigned_on: string;
  due_date: string | null;
  completed: boolean;
}

const EmployeeQuizList: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedQuizzes();
  }, []);

  const fetchAssignedQuizzes = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/quiz/employee/quizzes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      } else {
        toast.error('Failed to load quizzes');
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      toast.error('Error loading quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId: string) => {
    navigate(`/quiz/take/${quizId}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const pendingQuizzes = quizzes.filter(quiz => !quiz.completed);
  const completedQuizzes = quizzes.filter(quiz => quiz.completed);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Quizzes</h2>

      {/* Pending Quizzes */}
      {pendingQuizzes.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-orange-600">Pending Quizzes</h3>
          <div className="space-y-4">
            {pendingQuizzes.map((quiz) => (
              <Card key={quiz._id} className="border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg">{quiz.question_id.question_text}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Badge variant={quiz.question_id.difficulty === 'Easy' ? 'secondary' :
                                    quiz.question_id.difficulty === 'Medium' ? 'default' : 'destructive'}>
                        {quiz.question_id.difficulty}
                      </Badge>
                      {quiz.question_id.category && (
                        <Badge variant="outline">{quiz.question_id.category}</Badge>
                      )}
                      {quiz.due_date && (
                        <Badge variant="outline" className="text-red-600">
                          Due: {formatDate(quiz.due_date)}
                        </Badge>
                      )}
                    </div>
                    <Button onClick={() => handleStartQuiz(quiz._id)} className="bg-orange-600 hover:bg-orange-700">
                      Start Quiz
                    </Button>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Assigned on: {formatDate(quiz.assigned_on)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Quizzes */}
      {completedQuizzes.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-green-600">Completed Quizzes</h3>
          <div className="space-y-4">
            {completedQuizzes.map((quiz) => (
              <Card key={quiz._id} className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg">{quiz.question_id.question_text}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Badge variant={quiz.question_id.difficulty === 'Easy' ? 'secondary' :
                                    quiz.question_id.difficulty === 'Medium' ? 'default' : 'destructive'}>
                        {quiz.question_id.difficulty}
                      </Badge>
                      {quiz.question_id.category && (
                        <Badge variant="outline">{quiz.question_id.category}</Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Assigned on: {formatDate(quiz.assigned_on)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {quizzes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No quizzes assigned yet.</div>
          <div className="text-gray-400 mt-2">Check back later for new assignments.</div>
        </div>
      )}
    </div>
  );
};

export default EmployeeQuizList;