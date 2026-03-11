import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Label } from '../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';

interface FormData {
  module: string;
  questions: {
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: string;
    difficulty: string;
  }[];
}

const QuizAddEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      module: '',
      questions: [{
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        difficulty: 'Medium',
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
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
            module: question.category,
            questions: [{
              question_text: question.question_text,
              option_a: question.option_a,
              option_b: question.option_b,
              option_c: question.option_c,
              option_d: question.option_d,
              correct_option: question.correct_option,
              difficulty: question.difficulty,
            }],
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
      if (isEdit && id) {
        // Update single question
        const url = `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/quiz/admin/question/${id}`;
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(data.questions[0])
        });

        if (response.ok) {
          toast.success('Question updated successfully!');
          navigate('/quiz-admin');
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to update question');
        }
      } else {
        // Create multiple questions
        const baseUrl = `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/quiz/admin/question`;
        for (const q of data.questions) {
          const questionWithModule = { ...q, category: data.module };
          const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(questionWithModule)
          });

          if (!response.ok) {
            const errorData = await response.json();
            toast.error(`Failed to create question: ${errorData.message || 'Unknown error'}`);
            return;
          }
        }
        toast.success('Questions created successfully!');
        navigate('/quiz-admin');
      }
    } catch (error) {
      console.error('Error saving questions:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} questions. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">{isEdit ? 'Edit Question' : 'Add Questions to Module'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Module Selection */}
        <div className="mb-4">
          <Label htmlFor="module">Module Name *</Label>
          <Controller
            name="module"
            control={control}
            rules={{ required: 'Module name is required' }}
            render={({ field }) => <Input {...field} id="module" placeholder="Enter module name (e.g., Module 1)" />}
          />
          {errors.module && <p className="text-red-500 text-sm mt-1">{errors.module.message}</p>}
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="border p-4 mb-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Question {index + 1}</h3>
            {/* Question Text */}
            <div className="mb-4">
              <Label htmlFor={`question_text_${index}`}>Question Text *</Label>
              <Controller
                name={`questions.${index}.question_text`}
                control={control}
                rules={{ required: 'Question text is required' }}
                render={({ field }) => <Textarea {...field} id={`question_text_${index}`} placeholder="Enter the question" rows={3} />}
              />
              {errors.questions?.[index]?.question_text && <p className="text-red-500 text-sm mt-1">{errors.questions[index].question_text.message}</p>}
            </div>

            {/* Options */}
            <div className="mb-4">
              <h4 className="text-md font-semibold mb-2">Answer Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`option_a_${index}`}>Option A *</Label>
                  <Controller
                    name={`questions.${index}.option_a`}
                    control={control}
                    rules={{ required: 'Option A is required' }}
                    render={({ field }) => <Input {...field} id={`option_a_${index}`} placeholder="Enter option A" />}
                  />
                  {errors.questions?.[index]?.option_a && <p className="text-red-500 text-sm mt-1">{errors.questions[index].option_a.message}</p>}
                </div>
                <div>
                  <Label htmlFor={`option_b_${index}`}>Option B *</Label>
                  <Controller
                    name={`questions.${index}.option_b`}
                    control={control}
                    rules={{ required: 'Option B is required' }}
                    render={({ field }) => <Input {...field} id={`option_b_${index}`} placeholder="Enter option B" />}
                  />
                  {errors.questions?.[index]?.option_b && <p className="text-red-500 text-sm mt-1">{errors.questions[index].option_b.message}</p>}
                </div>
                <div>
                  <Label htmlFor={`option_c_${index}`}>Option C *</Label>
                  <Controller
                    name={`questions.${index}.option_c`}
                    control={control}
                    rules={{ required: 'Option C is required' }}
                    render={({ field }) => <Input {...field} id={`option_c_${index}`} placeholder="Enter option C" />}
                  />
                  {errors.questions?.[index]?.option_c && <p className="text-red-500 text-sm mt-1">{errors.questions[index].option_c.message}</p>}
                </div>
                <div>
                  <Label htmlFor={`option_d_${index}`}>Option D *</Label>
                  <Controller
                    name={`questions.${index}.option_d`}
                    control={control}
                    rules={{ required: 'Option D is required' }}
                    render={({ field }) => <Input {...field} id={`option_d_${index}`} placeholder="Enter option D" />}
                  />
                  {errors.questions?.[index]?.option_d && <p className="text-red-500 text-sm mt-1">{errors.questions[index].option_d.message}</p>}
                </div>
              </div>
            </div>

            {/* Correct Answer */}
            <div className="mb-4">
              <Label>Correct Answer *</Label>
              <Controller
                name={`questions.${index}.correct_option`}
                control={control}
                rules={{ required: 'Correct answer is required' }}
                render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="A" id={`correct_a_${index}`} />
                      <Label htmlFor={`correct_a_${index}`}>A</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="B" id={`correct_b_${index}`} />
                      <Label htmlFor={`correct_b_${index}`}>B</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="C" id={`correct_c_${index}`} />
                      <Label htmlFor={`correct_c_${index}`}>C</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="D" id={`correct_d_${index}`} />
                      <Label htmlFor={`correct_d_${index}`}>D</Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.questions?.[index]?.correct_option && <p className="text-red-500 text-sm mt-1">{errors.questions[index].correct_option.message}</p>}
            </div>

            {/* Difficulty */}
            <div className="mb-4">
              <Label>Difficulty</Label>
              <Controller
                name={`questions.${index}.difficulty`}
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

            {!isEdit && fields.length > 1 && (
              <Button type="button" variant="destructive" onClick={() => remove(index)} className="mt-2">
                Remove Question
              </Button>
            )}
          </div>
        ))}

        {!isEdit && (
          <Button type="button" onClick={() => append({
            question_text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_option: 'A',
            difficulty: 'Medium',
          })} className="mb-4">
            Add Another Question
          </Button>
        )}

        <div className="flex space-x-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Saving...' : (isEdit ? 'Update Question' : 'Create Questions')}
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