import { useApp } from '@/contexts/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { InputPhase } from './InputPhase';
import { GenerationPhase } from './GenerationPhase';
import { ConversationPhase } from './ConversationPhase';
import { SynthesisPhase } from './SynthesisPhase';

const Index = () => {
  const { state } = useApp();

  const renderPhase = () => {
    switch (state.phase) {
      case 'input':
        return <InputPhase />;
      case 'generation':
        return <GenerationPhase />;
      case 'conversation':
        return <ConversationPhase />;
      case 'synthesis':
        return <SynthesisPhase />;
      default:
        return <InputPhase />;
    }
  };

  return (
    <MainLayout>
      {renderPhase()}
    </MainLayout>
  );
};

export default Index;
