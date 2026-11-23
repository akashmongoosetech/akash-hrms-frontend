import React from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { Layout, Users, ClipboardCheck, TrendingUp, XCircle, CheckCircle, Calendar, Shield, Award } from 'lucide-react';

interface Quiz {
  _id: string;
  title: string;
  topic: string;
  questions: number;
  attempts: number;
  passRate: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

interface QuizStats {
  label: string;
  value: number;
  variant: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  icon: React.ComponentType;
}

const quizStats: QuizStats[] = [
  { label: 'Active Quizzes', value: 12, variant: 'primary', icon: Layout },
  { label: 'Total Attempts', value: 3421, variant: 'success', icon: Users },
  { label: 'Average Score', value: '85%', variant: 'info', icon: Award },
  { label: 'Pass Rate', value: '78%', variant: 'primary', icon: CheckCircle },
];

const QuizPage: React.FC = () => {
  const { notify } = useToast();

  const handleCreateQuiz = () => {
    notify({
      title: 'Quiz Created',
      description: 'New quiz has been successfully created',
      variant: 'success',
    });
  };

  const handlePublishQuiz = (quizId: string) => {
    notify({
      title: 'Published',
      description: `Quiz ${quizId} has been published`,
      variant: 'primary',
    });
  };

  const filterOptions = ['All Quizzes', 'Draft', 'Published', 'Archived'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quiz Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage employee quizzes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-500">Create Quiz</span>
            </div>
          </div>
          </Card>
        </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {quizStats.map((stat, index) => (
          <Card
            key={index}
            className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium"
          >
            <div className="flex items-center gap-3 mb-3">
              <stat.icon className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <StatusBadge status={stat.variant} size="sm" />
          </Card>
        ))}
      </div>

      {/* Create Quiz Form */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">Create New Quiz</h3>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Quiz Title</label>
            <input
              type="text"
              placeholder="e.g., Q1 2024 Compliance Quiz"
              className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Topic</label>
            <input
              type="text"
              placeholder="e.g., HR Policies"
              className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Questions</label>
            <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option>Select Question Count</option>
              <option>5</option>
              <option>10</option>
              <option>15</option>
              <option>20</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Pass Rate</label>
            <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option>Select Pass Rate</option>
              <option>70%</option>
              <option>80%</option>
              <option>90%</option>
              <option>100%</option>
            </select>
          </div>
          <Button variant="primary" type="submit" className="grid col-span-2">
            <Award className="mr-2 h-4 w-4" /> Create Quiz
          </Button>
        </form>
      </div>

      {/* Quizzes Table */}
      <Card className="p-6 bg-white rounded-2xl shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Employee Quizzes</h3>
          <Button variant="ghost" size="sm" className="text-sm text-primary/70">
            Create Quiz
          </Button>
        </div>
        <div className="space-y-3 text-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <QuizRow key={num} quiz={{
              _id: String(num),
              title: `Quiz #${num}: HR Compliance`,
              topic: 'HR Policies and Procedures',
              questions: num * 5,
              attempts: Math.floor(Math.random() * 500) + 100,
              passRate: Math.random() * 30 + 70,
              status: num <= 5 ? 'draft' : 'published',
              createdAt: '2024-01-15',
            }} />
          ))}
        </div>
      </Card>
    </div>
  );
};

const QuizRow = ({ quiz }: { quiz: Quiz }) => {
  const statusMap: Record<string, { variant: string; bg: string }> = {
    draft: { variant: 'warning', bg: 'var(--accent)' },
    published: { variant: 'success', bg: 'var(--success)' },
    archived: { variant: 'secondary', bg: 'var(--secondary)' },
  };

  const statusInfo = statusMap[quiz.status] || statusMap.published;

  return (
    <div className="px-6 py-4 border-b border-border opacity-30 last:border-0 flex items-center gap-3">
      <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: statusInfo.bg }}>
        <StatusBadge status={quiz.status} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{quiz.title}</p>
        <p className="text-xs text-gray-500 truncate">{quiz.topic}</p>
      </div>
      <div className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium" style={{ backgroundColor: statusInfo.bg, color: statusInfo.bg === 'var(--primary)' ? 'var(--primary-foreground)' : 'var(--secondary-foreground)' }}>
        {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
      </div>
      <div className="text-right flex-1">
        <Button variant="ghost" size="sm" className="text-xs text-primary/70">
          View
        </Button>
        <Button variant="ghost" size="sm" className="text-xs text-destructive/70">
          Delete
        </Button>
      </div>
    </div>
  );
};

export default QuizPage;