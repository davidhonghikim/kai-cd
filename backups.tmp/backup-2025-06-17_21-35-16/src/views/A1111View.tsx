import React, { useState, useEffect, useCallback } from 'react';
import { Service, ImageModel, ImageGenOptions } from '@/types';
import styles from '@/styles/components/sidepanel/A1111View.module.css';
import { A1111Connector } from '@/services/image/a1111Connector';
import ViewHeader from '@/components/ViewHeader';

interface A1111ViewProps {
  service: Service;
  isTab?: boolean;
}

interface Sampler {
  name: string;
}

const A1111View: React.FC<A1111ViewProps> = ({ service, isTab = false }) => {
    if (!service || !service.url || !service.type) {
        console.error('A1111View: Invalid service prop', service);
        return <div style={{ padding: 32, color: 'red' }}>Error: Invalid service configuration. Please check your service settings.</div>;
    }
    const [models, setModels] = useState<ImageModel[]>([]);
    const [samplers, setSamplers] = useState<Sampler[]>([]);
    const [selectedModelId, setSelectedModelId] = useState<string>('');
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [sampler, setSampler] = useState<string>('');
    const [steps, setSteps] = useState(20);
    const [cfgScale, setCfgScale] = useState(7);
    const [width, setWidth] = useState(512);
    const [height, setHeight] = useState(512);
    const [seed, setSeed] = useState(-1);
    
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connector = new A1111Connector(service);

    const fetchData = useCallback(async () => {
        try {
            const [modelsData, samplersData] = await Promise.all([
                connector.getModels(),
                connector.getSamplers()
            ]);
            setModels(modelsData);
            setSamplers(samplersData);
            if (modelsData.length > 0) setSelectedModelId(modelsData[0].id);
            if (samplersData.length > 0) {
                setSampler(samplersData[0].name);
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred');
        }
    }, [service]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleGenerate = async () => {
        if (!prompt || !selectedModelId) {
            setError('Prompt and model are required.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        const options: ImageGenOptions = {
            model: selectedModelId,
            negativePrompt,
            sampler,
            steps,
            cfgScale,
            width,
            height,
            seed,
        };

        try {
            const imageArtifact = await connector.generateImage(prompt, options);
            if (imageArtifact.url) {
                setGeneratedImage(imageArtifact.url);
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <div className={styles.container}>
      <ViewHeader service={service} isTab={isTab} />
      <div className={styles.content}>
        <div className={styles.controls}>
            <div className={styles.controlGroup}>
                <label>Model:</label>
                <select value={selectedModelId} onChange={e => setSelectedModelId(e.target.value)}>
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
            </div>
            
            <textarea className={styles.promptInput} placeholder="Prompt..." value={prompt} onChange={e => setPrompt(e.target.value)} />
            <textarea className={styles.promptInput} placeholder="Negative Prompt..." value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} />

            <div className={styles.controlGroup}>
                <label>Sampler:</label>
                <select value={sampler} onChange={e => setSampler(e.target.value)}>
                    {samplers.map(s => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                </select>
                <label>Steps: {steps}</label>
                <input type="range" min="1" max="150" value={steps} onChange={e => setSteps(Number(e.target.value))} />
            </div>

            <div className={styles.controlGroup}>
                <label>Width: {width}</label>
                <input type="range" min="64" max="2048" step="8" value={width} onChange={e => setWidth(Number(e.target.value))} />
                <label>Height: {height}</label>
                <input type="range" min="64" max="2048" step="8" value={height} onChange={e => setHeight(Number(e.target.value))} />
                <label>CFG: {cfgScale}</label>
                <input type="range" min="1" max="30" step="0.5" value={cfgScale} onChange={e => setCfgScale(Number(e.target.value))} />
            </div>

             <div className={styles.controlGroup}>
                <label>Seed:</label>
                <input type="number" value={seed} onChange={e => setSeed(Number(e.target.value))} />
            </div>

            <button onClick={handleGenerate} disabled={isLoading} className={styles.generateButton}>
                {isLoading ? 'Generating...' : 'Generate'}
            </button>
        </div>

        <div className={styles.output}>
            {error && <div className={styles.error}>{error}</div>}
            {isLoading && <div className={styles.progressBar}>Generating...</div>}
            {generatedImage ? (
                <img src={generatedImage} alt="Generated output" />
            ) : (
                <div className={styles.placeholder}>No image generated yet.</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default A1111View;