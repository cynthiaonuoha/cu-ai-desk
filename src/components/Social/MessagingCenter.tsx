
import { useState, useEffect } from 'react';
import ConversationsList from './ConversationsList';
import ChatInterface from './ChatInterface';

interface MessagingCenterProps {
  selectedConversation?: {
    partnerId: string;
    partnerName: string;
    partnerAvatar?: string;
  } | null;
  onConversationChange?: (conversation: {
    partnerId: string;
    partnerName: string;
    partnerAvatar?: string;
  } | null) => void;
}

const MessagingCenter = ({ selectedConversation: externalSelectedConversation, onConversationChange }: MessagingCenterProps) => {
  const [internalSelectedConversation, setInternalSelectedConversation] = useState<{
    partnerId: string;
    partnerName: string;
    partnerAvatar?: string;
  } | null>(null);

  // Use external conversation if provided, otherwise use internal state
  const selectedConversation = externalSelectedConversation || internalSelectedConversation;

  // Sync external conversation changes
  useEffect(() => {
    if (externalSelectedConversation) {
      setInternalSelectedConversation(externalSelectedConversation);
    }
  }, [externalSelectedConversation]);

  const handleSelectConversation = (partnerId: string, partnerName: string, partnerAvatar?: string) => {
    const conversation = { partnerId, partnerName, partnerAvatar };
    setInternalSelectedConversation(conversation);
    
    // Notify parent component if callback provided
    if (onConversationChange) {
      onConversationChange(conversation);
    }
  };

  const handleBack = () => {
    setInternalSelectedConversation(null);
    
    // Notify parent component if callback provided
    if (onConversationChange) {
      onConversationChange(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {selectedConversation ? (
        <ChatInterface
          partnerId={selectedConversation.partnerId}
          partnerName={selectedConversation.partnerName}
          partnerAvatar={selectedConversation.partnerAvatar}
          onBack={handleBack}
        />
      ) : (
        <ConversationsList onSelectConversation={handleSelectConversation} />
      )}
    </div>
  );
};

export default MessagingCenter;
