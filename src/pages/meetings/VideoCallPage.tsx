import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp } from 'lucide-react';
import { useMeetings } from '../../context/MeetingsContext';
import { useAuth } from '../../context/AuthContext';
import { findUserById, getUserLabel } from '../../utils/userDirectory';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export const VideoCallPage: React.FC = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { meetings, markAsCompleted } = useMeetings();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  if (!user) return null;

  const meeting = meetings.find((m) => m.id === meetingId);

  useEffect(() => {
    if (!meeting) {
      toast.error('Meeting not found');
      navigate(-1);
      return;
    }
    if (meeting.status !== 'accepted' && meeting.status !== 'completed') {
      toast.error('You can only join accepted meetings');
      navigate(-1);
    }
  }, [meeting, navigate]);

  if (!meeting || (meeting.status !== 'accepted' && meeting.status !== 'completed')) {
    return null;
  }

  const otherPartyId = meeting.senderId === user.id ? meeting.receiverId : meeting.senderId;
  const otherParty = findUserById(otherPartyId);
  const otherPartyName = otherParty?.name ?? getUserLabel(otherPartyId);

  const handleEndCall = () => {
    if (meeting.status === 'accepted') {
      markAsCompleted(meeting.id);
    }
    toast.success('Call ended');
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-[72px])] bg-gray-900 -mx-4 -mt-6 sm:-mx-6 lg:-mx-8">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-lg font-semibold text-white">{meeting.title}</h1>
        <div className="px-3 py-1 text-sm font-medium text-green-400 bg-green-400/10 rounded-full">
          00:15:23
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 sm:p-6 overflow-hidden">
        <div className={`grid gap-4 h-full ${isScreenSharing ? 'grid-cols-4 grid-rows-4' : 'grid-cols-1 md:grid-cols-2'}`}>
          {/* Main shared screen (if active) */}
          {isScreenSharing && (
            <div className="col-span-4 row-span-3 lg:col-span-3 lg:row-span-4 bg-gray-800 rounded-xl overflow-hidden border border-gray-700 flex items-center justify-center">
              <div className="text-center">
                <MonitorUp size={48} className="mx-auto text-primary-500 mb-4" />
                <p className="text-white font-medium">You are sharing your screen</p>
              </div>
            </div>
          )}

          {/* Local User */}
          <div className={`${isScreenSharing ? 'col-span-2 row-span-1 lg:col-span-1 lg:row-span-2' : ''} bg-gray-800 rounded-xl overflow-hidden border border-gray-700 relative`}>
            {isVideoOn ? (
              <img
                src={`https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800`}
                alt="Local user"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-bold text-white mb-4">
                  {user.name.charAt(0)}
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-md text-white text-sm font-medium flex items-center">
                You
                {!isMicOn && <MicOff size={14} className="ml-2 text-error-400" />}
              </div>
            </div>
          </div>

          {/* Remote User */}
          <div className={`${isScreenSharing ? 'col-span-2 row-span-1 lg:col-span-1 lg:row-span-2' : ''} bg-gray-800 rounded-xl overflow-hidden border border-gray-700 relative`}>
            <img
              src={otherParty?.avatarUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800"}
              alt="Remote user"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4">
              <div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-md text-white text-sm font-medium">
                {otherPartyName}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="h-20 bg-gray-800 border-t border-gray-700 flex items-center justify-center gap-4 px-6">
        <Button
          variant={isMicOn ? 'secondary' : 'error'}
          size="lg"
          className="!rounded-full p-4"
          onClick={() => setIsMicOn(!isMicOn)}
        >
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </Button>

        <Button
          variant={isVideoOn ? 'secondary' : 'error'}
          size="lg"
          className="!rounded-full p-4"
          onClick={() => setIsVideoOn(!isVideoOn)}
        >
          {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
        </Button>

        <Button
          variant={isScreenSharing ? 'primary' : 'secondary'}
          size="lg"
          className="!rounded-full p-4 hidden sm:flex"
          onClick={() => setIsScreenSharing(!isScreenSharing)}
        >
          <MonitorUp size={24} />
        </Button>

        <Button
          variant="error"
          size="lg"
          className="!rounded-full p-4 ml-4"
          onClick={handleEndCall}
        >
          <PhoneOff size={24} />
        </Button>
      </div>
    </div>
  );
};
