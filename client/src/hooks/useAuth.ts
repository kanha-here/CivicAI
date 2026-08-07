import { useEffect, useState } from "react";
import { authService } from "../services/auth.service";

export function useCurrentUser() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setData(null);
      return;
    }

    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const user = await authService.me();
        setData(user);
      } catch (err) {
        setError(err as Error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { data, isLoading, error, refetch: () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    authService.me().then(setData).catch(setError);
  } };
}
