import { createAppDependencies } from './dependencyFactory';
import { initPerformanceMonitoring } from '../utils/perf';

export const AppInitializer: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [dependencies, setDependencies] = useState<AppDependencies | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      const deps = await createAppDependencies();
      initPerformanceMonitoring();
      setupErrorHandling(deps.errorService);
      await deps.marketDataService.connect();
      setDependencies(deps);
    };

    initializeApp();
    
    return () => dependencies?.marketDataService.disconnect();
  }, []);

  if (!dependencies) return <LoadingOverlay />;

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
};