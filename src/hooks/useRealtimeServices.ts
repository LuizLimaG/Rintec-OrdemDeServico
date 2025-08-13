import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface Service {
  id: string;
  type: string;
  ps: string;
  start_date: string;
  end_date: string;
  responsible: string;
  status: string;
  created_at: string;
}

interface Observation {
  id: string;
  service_id: string;
  description: string;
  observation_date: string;
  observation_type: string;
  team_member_id: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useRealtimeServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setServices(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();

    const subscription = supabase
      .channel("services_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "services",
        },
        (payload) => {
          console.log("Mudança detectada:", payload);

          switch (payload.eventType) {
            case "INSERT":
              setServices((prev) => [payload.new as Service, ...prev]);
              break;

            case "UPDATE":
              setServices((prev) =>
                prev.map((service) =>
                  service.id === payload.new.id
                    ? { ...service, ...(payload.new as Service) }
                    : service
                )
              );
              break;

            case "DELETE":
              setServices((prev) =>
                prev.filter((service) => service.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { services, loading, error };
}

export function useRealtimeObservations(serviceId?: string) {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceId) return;

    const fetchObservations = async () => {
      const { data, error } = await supabase
        .from("observations")
        .select(
          `
          *,
          team:team_member_id(name, position)
        `
        )
        .eq("service_id", serviceId)
        .order("observation_date", { ascending: false });

      if (!error) setObservations(data || []);
      setLoading(false);
    };

    fetchObservations();

    const subscription = supabase
      .channel(`observations_${serviceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "observations",
          filter: `service_id=eq.${serviceId}`,
        },
        (payload) => {
          switch (payload.eventType) {
            case "INSERT":
              setObservations((prev) => [payload.new as Observation, ...prev]);
              break;

            case "UPDATE":
              setObservations((prev) =>
                prev.map((obs) =>
                  obs.id === payload.new.id
                    ? { ...obs, ...(payload.new as Observation) }
                    : obs
                )
              );
              break;

            case "DELETE":
              setObservations((prev) =>
                prev.filter((obs) => obs.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [serviceId]);

  return { observations, loading };
}
