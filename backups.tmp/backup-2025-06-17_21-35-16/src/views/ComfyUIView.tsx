import React, { useState } from 'react';
import { Service, ComfyUIWorkflowInput } from '@/types';
import { ComfyUIConnector } from '@/services/image/comfyUIConnector';
import styles from '@/styles/components/sidepanel/ComfyUIView.module.css';
import ViewHeader from '@/components/ViewHeader';

interface ComfyUIViewProps {
  service: Service;
  isTab?: boolean;
}

const ComfyUIView: React.FC<ComfyUIViewProps> = ({ service, isTab = false }) => {
    if (!service || !service.url || !service.type) {
        console.error('ComfyUIView: Invalid service prop', service);
        return <div style={{ padding: 32, color: 'red' }}>Error: Invalid service configuration. Please check your service settings.</div>;
    }
    const [workflowJson, setWorkflowJson] = useState('');
    const [inputs, setInputs] = useState<ComfyUIWorkflowInput[]>([]);
    const [userInputs, setUserInputs] = useState<Record<string, Record<string, any>>>({});

    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connector = new ComfyUIConnector(service);

    const handleLoadWorkflow = () => {
        try {
            const parsedInputs = connector.parseWorkflow(workflowJson);
            setInputs(parsedInputs);
            setError(null);
        } catch (e: any) {
            setError('Invalid Workflow JSON: ' + e.message);
            setInputs([]);
        }
    };
    
    const handleInputChange = (nodeId: string, inputId: string, value: any) => {
        setUserInputs(prev => ({
            ...prev,
            [nodeId]: {
                ...prev[nodeId],
                [inputId]: value,
            }
        }));
    };

    const handleExecute = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const imageUrl = await connector.executeWorkflow(workflowJson, userInputs);
            setGeneratedImage(imageUrl);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderInput = (input: ComfyUIWorkflowInput) => {
        switch (input.inputType) {
            case 'text':
                return <textarea placeholder={input.inputName} onChange={e => handleInputChange(input.nodeId, input.inputId, e.target.value)} />;
            case 'number':
                return <input type="number" placeholder={input.inputName} onChange={e => handleInputChange(input.nodeId, input.inputId, Number(e.target.value))} />;
            default:
                return <input type="text" placeholder={`${input.inputName} (Unsupported)`} />;
        }
    };

    return (
        <div className={styles.container}>
            <ViewHeader service={service} isTab={isTab} />
            <div className={styles.content}>
                <div className={styles.controls}>
                    <div className={styles.workflowLoader}>
                        <textarea 
                            className={styles.workflowInput} 
                            placeholder="Paste ComfyUI Workflow JSON here..." 
                            value={workflowJson}
                            onChange={e => setWorkflowJson(e.target.value)} 
                        />
                        <button onClick={handleLoadWorkflow}>Load Workflow</button>
                    </div>

                    <div className={styles.dynamicControls}>
                        {inputs.map(input => (
                            <div key={`${input.nodeId}-${input.inputId}`} className={styles.controlGroup}>
                                <label>{input.nodeTitle} &rarr; {input.inputName}</label>
                                {renderInput(input)}
                            </div>
                        ))}
                    </div>
                    
                    {inputs.length > 0 && (
                        <button onClick={handleExecute} disabled={isLoading} className={styles.generateButton}>
                            {isLoading ? 'Executing...' : 'Execute'}
                        </button>
                    )}
                </div>

                <div className={styles.output}>
                    {error && <div className={styles.error}>{error}</div>}
                    {isLoading && <div className={styles.placeholder}>Executing...</div>}
                    {generatedImage ? <img src={generatedImage} alt="Generated output" /> : <div className={styles.placeholder}>Output will appear here.</div>}
                </div>
            </div>
        </div>
    );
};

export default ComfyUIView;
