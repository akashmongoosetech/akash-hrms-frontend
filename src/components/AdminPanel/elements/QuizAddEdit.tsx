import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Label } from '../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';

interface FormData {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  difficulty: string;
  category: string;
}

const QuizAddEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A',
      difficulty: 'Medium',
      category: '',
    },
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      fetchQuestion(id);
    }
  }, [isEdit, id]);

  const fetchQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/quiz/admin/questions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const questions = await response.json();
        const question = questions.find((q: any) => q._id === questionId);
        if (question) {
          reset({
            question_text: question.question_text,
            option_a: question.option_a,
            option_b: question.option_b,
            option_c: question.option_c,
            option_d: question.option_d,
            correct_option: question.correct_option,
            difficulty: question.difficulty,
            category: question.category,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching question:', err);
      toast.error('Failed to load question');
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const url = isEdit
        ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/quiz/admin/question/${id}`
        : `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/quiz/admin/question`;

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success(`Question ${isEdit ? 'updated' : 'created'} successfully!`);
        navigate('/quiz-admin');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to ${isEdit ? 'update' : 'create'} question`);
      }
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} question. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">{isEdit ? 'Edit Question' : 'Add New Question'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Question Text */}
        <div>
          <Label htmlFor="question_text">Question Text *</Label>
          <Controller
            name="question_text"
            control={control}
            rules={{ required: 'Question text is required' }}
            render={({ field }) => <Textarea {...field} id="question_text" placeholder="Enter the question" rows={3} />}
          />
          {errors.question_text && <p className="text-red-500 text-sm mt-1">{errors.question_text.message}</p>}
        </div>

        {/* Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Answer Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="option_a">Option A *</Label>
              <Controller
                name="option_a"
                control={control}
                rules={{ required: 'Option A is required' }}
                render={({ field }) => <Input {...field} id="option_a" placeholder="Enter option A" />}
              />
              {errors.option_a && <p className="text-red-500 text-sm mt-1">{errors.option_a.message}</p>}
            </div>
            <div>
              <Label htmlFor="option_b">Option B *</Label>
              <Controller
                name="option_b"
                control={control}
                rules={{ required: 'Option B is required' }}
                render={({ field }) => <Input {...field} id="option_b" placeholder="Enter option B" />}
              />
              {errors.option_b && <p className="text-red-500 text-sm mt-1">{errors.option_b.message}</p>}
            </div>
            <div>
              <Label htmlFor="option_c">Option C *</Label>
              <Controller
                name="option_c"
                control={control}
                rules={{ required: 'Option C is required' }}
                render={({ field }) => <Input {...field} id="option_c" placeholder="Enter option C" />}
              />
              {errors.option_c && <p className="text-red-500 text-sm mt-1">{errors.option_c.message}</p>}
            </div>
            <div>
              <Label htmlFor="option_d">Option D *</Label>
              <Controller
                name="option_d"
                control={control}
                rules={{ required: 'Option D is required' }}
                render={({ field }) => <Input {...field} id="option_d" placeholder="Enter option D" />}
              />
              {errors.option_d && <p className="text-red-500 text-sm mt-1">{errors.option_d.message}</p>}
            </div>
          </div>
        </div>

        {/* Correct Answer */}
        <div>
          <Label>Correct Answer *</Label>
          <Controller
            name="correct_option"
            control={control}
            rules={{ required: 'Correct answer is required' }}
            render={({ field }) => (
              <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="A" id="correct_a" />
                  <Label htmlFor="correct_a">A</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="B" id="correct_b" />
                  <Label htmlFor="correct_b">B</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="C" id="correct_c" />
                  <Label htmlFor="correct_c">C</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="D" id="correct_d" />
                  <Label htmlFor="correct_d">D</Label>
                </div>
              </RadioGroup>
            )}
          />
          {errors.correct_option && <p className="text-red-500 text-sm mt-1">{errors.correct_option.message}</p>}
        </div>

        {/* Difficulty and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Difficulty</Label>
            <Controller
              name="difficulty"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => <Input {...field} id="category" placeholder="Enter category (optional)" />}
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Saving...' : (isEdit ? 'Update Question' : 'Create Question')}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/quiz-admin')} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuizAddEdit;