import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Users, Calendar, Building2, MapPin, UserCircle, FileText, DollarSign, Send } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { findUserById } from '../../data/users';
import { createCollaborationRequest, getRequestsFromInvestor } from '../../data/collaborationRequests';
import { Entrepreneur } from '../../types';
import { TransferModal } from '../../components/payments/TransferModal';

export const EntrepreneurProfile: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [isTransferModalOpen, setIsTransferModalOpen] = React.useState(false);
  
  const entrepreneur = findUserById(id) as Entrepreneur | null;
  
  if (!entrepreneur || entrepreneur.role !== 'entrepreneur') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Entrepreneur not found</h2>
        <Link to="/dashboard/investor">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }
  
  const isCurrentUser = currentUser?.id === entrepreneur.id;
  const isInvestor = currentUser ? currentUser.role === 'investor' : false;
  
  const hasRequestedCollaboration = isInvestor && currentUser && id 
    ? getRequestsFromInvestor(currentUser.id).some(req => req.entrepreneurId === id)
    : false;
  
  const handleSendRequest = () => {
    if (isInvestor && currentUser && id) {
      createCollaborationRequest(
        currentUser.id,
        id,
        `I'm interested in ${entrepreneur.startupName}.`
      );
      window.location.reload();
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
          <div className="sm:flex sm:space-x-6">
            <Avatar src={entrepreneur.avatarUrl} alt={entrepreneur.name} size="xl" />
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{entrepreneur.name}</h1>
              <p className="text-gray-600">Founder at {entrepreneur.startupName}</p>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-0 flex gap-2">
            {!isCurrentUser ? (
              <React.Fragment>
                <Link to={`/chat/${entrepreneur.id}`}>
                  <Button variant="outline" leftIcon={<MessageCircle size={18} />}>Message</Button>
                </Link>
                {isInvestor ? (
                  <Button
                    leftIcon={<Send size={18} />}
                    disabled={hasRequestedCollaboration}
                    onClick={handleSendRequest}
                    className="mr-2"
                  >
                    {hasRequestedCollaboration ? 'Sent' : 'Connect'}
                  </Button>
                ) : null}
                {isInvestor && hasRequestedCollaboration ? (
                  <Button
                    variant="primary"
                    className="bg-green-600 text-white"
                    leftIcon={<DollarSign size={18} />}
                    onClick={() => setIsTransferModalOpen(true)}
                  >
                    Fund
                  </Button>
                ) : null}
              </React.Fragment>
            ) : (
              <Button variant="outline" leftIcon={<UserCircle size={18} />}>Edit</Button>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="text-lg font-medium">About</h2></CardHeader>
          <CardBody><p>{entrepreneur.bio}</p></CardBody>
        </Card>
        <Card>
          <CardHeader><h2 className="text-lg font-medium">Startup</h2></CardHeader>
          <CardBody><p>{entrepreneur.pitchSummary}</p></CardBody>
        </Card>
      </div>

      <TransferModal 
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        recipient={entrepreneur}
      />
    </div>
  );
};