import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Question {
  _id: string;
  question_text: string;
  difficulty: string;
  category: string;
}

interface FormData {
  employee_id: string;
  questions: string[];
  due_date: string;
}

const QuizAssign: React.FC = () => {
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    defaultValues: {
      employee_id: '',
      questions: [],
      due_date: '',
    },
  });

  const [employees, setEmployees] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  useEffect(() => {
    fetchEmployees();
    fetchQuestions();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/users?role=Employee`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/quiz/admin/questions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const handleQuestionToggle = (questionId: string, checked: boolean) => {
    let newSelected;
    if (checked) {
      newSelected = [...selectedQuestions, questionId];
    } else {
      newSelected = selectedQuestions.filter(id => id !== questionId);
    }
    setSelectedQuestions(newSelected);
    setValue('questions', newSelected);
  };

  const onSubmit = async (data: FormData) => {
    if (!data.employee_id || data.questions.length === 0) {
      toast.error('Please select an employee and at least one question');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/quiz/admin/assign-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Quiz assigned successfully!');
        navigate('/quiz-admin');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to assign quiz');
      }
    } catch (error) {
      console.error('Error assigning quiz:', error);
      toast.error('Failed to assign quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Assign Quiz to Employee</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Employee Selection */}
        <div>
          <Label>Employee *</Label>
          <Controller
            name="employee_id"
            control={control}
            rules={{ required: 'Employee selection is required' }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee._id} value={employee._id}>
                      {employee.firstName} {employee.lastName} ({employee.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.employee_id && <p className="text-red-500 text-sm mt-1">{errors.employee_id.message}</p>}
        </div>

        {/* Due Date */}
        <div>
          <Label htmlFor="due_date">Due Date (Optional)</Label>
          <Controller
            name="due_date"
            control={control}
            render={({ field }) => <Input {...field} id="due_date" type="date" />}
          />
        </div>

        {/* Question Selection */}
        <div>
          <Label>Questions *</Label>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Questions ({selectedQuestions.length} selected)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questions.map((question) => (
                  <div key={question._id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={`question-${question._id}`}
                      checked={selectedQuestions.includes(question._id)}
                      onCheckedChange={(checked) => handleQuestionToggle(question._id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <label htmlFor={`question-${question._id}`} className="text-sm font-medium cursor-pointer">
                        {question.question_text}
                      </label>
                      <div className="flex space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs ${
                          question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty}
                        </span>
                        {question.category && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {question.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No questions available. Please add questions first.
                </div>
              )}
            </CardContent>
          </Card>
          {errors.questions && <p className="text-red-500 text-sm mt-1">{errors.questions.message}</p>}
        </div>

        <div className="flex space-x-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Assigning...' : 'Assign Quiz'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/quiz-admin')} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuizAssign;