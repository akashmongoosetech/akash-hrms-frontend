import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import { formatDate } from '../../Common/Commonfunction';
import { Twitter, Facebook, Linkedin } from 'lucide-react';

interface VerificationResult {
  valid: boolean;
  learner: {
    firstName: string;
    lastName: string;
    email: string;
    employeeCode?: string;
    photo?: string;
    department?: string;
    joiningDate?: string;
    mobile1?: string;
    role?: string;
    status?: string;
  };
  course: {
    title: string;
  };
  certificateId: string;
  completedAt: string;
}

export default function CertificateVerificationPage() {
  const { certificateId: paramCertificateId } = useParams<{ certificateId: string }>();
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (paramCertificateId) {
      setCertificateId(paramCertificateId);
      handleVerify(paramCertificateId);
    }
  }, [paramCertificateId]);

  // Utility to get image URL
  const getImageUrl = (path?: string) => {
    if (!path) return '';

    let cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, ''); // normalize path

    // If it already includes full URL, return as is
    if (cleanPath.startsWith('http')) return cleanPath;

    // Extract filename from path if it contains full path
    if (cleanPath.includes('/')) {
      cleanPath = cleanPath.split('/').pop() || cleanPath;
    }

    // Ensure it starts with 'uploads/'
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = `uploads/${cleanPath}`;
    }

    return `${API_URL}/${cleanPath}`;
  };

  const handleVerify = async (id?: string) => {
    const certId = id || certificateId;
    if (!certId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await API.post('/courses/verify-certificate', {
        certificateId: certId.trim()
      });

      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const response = await API.get(`/courses/download-certificate/${result!.certificateId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${result!.certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError('Failed to download certificate');
    }
  };

  const handleShare = (platform: string) => {
    const certificateUrl = `${window.location.origin}/certificate-verification/${result!.certificateId}`;
    const text = `Check out my certificate: ${result!.course.title} completed by ${result!.learner.firstName} ${result!.learner.lastName}`;
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(certificateUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certificateUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`;
        break;
    }
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Certificate Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="certificateId">Certificate ID</Label>
            <Input
              id="certificateId"
              type="text"
              placeholder="Enter certificate ID (e.g., CERT-1234567890-abc123)"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-center text-lg"
            />
          </div>

          <Button
            onClick={() => handleVerify()}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? <Loader /> : 'Verify Certificate'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && result.valid && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription className="text-green-700 font-semibold">
                  ✓ Certificate Verified Successfully
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Certificate Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Certificate Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Certificate ID</Label>
                        <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{result.certificateId}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Completion Date</Label>
                        <p className="text-sm">{formatDate(result.completedAt)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Course Completed</Label>
                        <p className="text-lg font-semibold">{result.course.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Learner Profile */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Learner Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Profile Picture and Basic Info */}
                    <div className="flex items-center space-x-4">
                      {result.learner.photo ? (
                        <img
                          src={getImageUrl(result.learner.photo)}
                          alt="Profile"
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-lg font-semibold">
                            {result.learner.firstName?.[0]}{result.learner.lastName?.[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-xl font-bold text-blue-600">
                          {result.learner.firstName} {result.learner.lastName}
                        </p>
                        {result.learner.employeeCode && (
                          <p className="text-sm text-gray-500">Employee Code: {result.learner.employeeCode}</p>
                        )}
                      </div>
                    </div>

                    {/* Profile Details */}
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                        <p className="text-sm">{result.learner.email}</p>
                      </div>

                      {result.learner.mobile1 && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Mobile</Label>
                          <p className="text-sm">{result.learner.mobile1}</p>
                        </div>
                      )}

                      {/* {result.learner.department && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Department</Label>
                          <p className="text-sm">{result.learner.department}</p>
                        </div>
                      )} */}

                      <div className="grid grid-cols-2 gap-4">
                        {result.learner.role && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Role</Label>
                            <p className="text-sm">{result.learner.role}</p>
                          </div>
                        )}

                        {result.learner.status && (
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Status</Label>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              result.learner.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {result.learner.status}
                            </span>
                          </div>
                        )}
                      </div>

                      {result.learner.joiningDate && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Joining Date</Label>
                          <p className="text-sm">{formatDate(result.learner.joiningDate)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center space-x-4 mt-6">
                <Button variant="sucess" onClick={handleDownloadCertificate}>
                  Download Certificate
                </Button>




                <Button variant="twitter" onClick={() => handleShare('twitter')}>
                  <Twitter className='text-[20px]'/>
                </Button>
                <Button variant="outline" onClick={() => handleShare('facebook')}>
                  <Facebook/>
                </Button>
                <Button variant="outline" onClick={() => handleShare('linkedin')}>
                  <Linkedin/>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}