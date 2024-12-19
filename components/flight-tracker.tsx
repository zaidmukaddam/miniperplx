import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, Terminal } from "lucide-react";
import { motion } from "framer-motion";

interface FlightApiResponse {
  data: Array<{
    flight_date: string;
    flight_status: string;
    departure: {
      airport: string;
      timezone: string;
      iata: string;
      terminal: string | null;
      gate: string | null;
      delay: number | null;
      scheduled: string;
    };
    arrival: {
      airport: string;
      timezone: string;
      iata: string;
      terminal: string | null;
      gate: string | null;
      delay: number | null;
      scheduled: string;
    };
    airline: {
      name: string;
      iata: string;
    };
    flight: {
      number: string;
      iata: string;
      duration: number | null;
    };
  }>;
}

interface FlightTrackerProps {
  data: FlightApiResponse;
}

export function FlightTracker({ data }: FlightTrackerProps) {
  if (!data?.data?.[0]) {
    return null;
  }

  const flight = data.data[0];

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    }) + ' UTC';
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const mapStatus = (status: string): "LANDED" | "DEPARTING ON TIME" | "DELAYED" | "SCHEDULED" => {
    switch (status.toLowerCase()) {
      case 'landed':
        return 'LANDED';
      case 'active':
        return flight.departure.delay ? 'DELAYED' : 'DEPARTING ON TIME';
      case 'scheduled':
        return 'SCHEDULED';
      default:
        return 'SCHEDULED';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LANDED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "DEPARTING ON TIME":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "DELAYED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200";
    }
  };

  const flightInfo = {
    flightNumber: flight.flight.iata,
    status: mapStatus(flight.flight_status),
    departure: {
      airport: flight.departure.airport,
      code: flight.departure.iata,
      time: formatTime(flight.departure.scheduled),
      date: formatDate(flight.departure.scheduled),
      terminal: flight.departure.terminal || undefined,
      gate: flight.departure.gate || undefined
    },
    arrival: {
      airport: flight.arrival.airport,
      code: flight.arrival.iata,
      time: formatTime(flight.arrival.scheduled),
      date: formatDate(flight.arrival.scheduled),
      terminal: flight.arrival.terminal || undefined,
      gate: flight.arrival.gate || undefined
    },
    duration: flight.flight.duration ? `${flight.flight.duration} minutes` : 'N/A',
    lastUpdated: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  };

  return (
    <Card className="w-full max-w-2xl bg-card dark:bg-card">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">{flightInfo.flightNumber}</h2>
            <Badge className={getStatusColor(flightInfo.status)}>
              {flightInfo.status}
            </Badge>
          </div>
        </div>

        <div className="relative">
          <div className="flex justify-between items-center">
            <div className="text-4xl font-mono">{flightInfo.departure.code}</div>
            <motion.div 
              className="text-primary"
              initial={{ x: -50 }}
              animate={{ x: 50 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Plane className="h-6 w-6" />
            </motion.div>
            <div className="text-4xl font-mono">{flightInfo.arrival.code}</div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-8">
            <div>
              <p className="text-lg font-medium">{flightInfo.departure.airport}</p>
              <p className="text-3xl font-bold mt-1">{flightInfo.departure.time}</p>
              <p className="text-sm text-muted-foreground">{flightInfo.departure.date}</p>
              {(flightInfo.departure.terminal || flightInfo.departure.gate) && (
                <div className="mt-2 flex items-center gap-4">
                  {flightInfo.departure.terminal && (
                    <div className="flex items-center gap-1">
                      <Terminal className="h-4 w-4" />
                      <span>Terminal {flightInfo.departure.terminal}</span>
                    </div>
                  )}
                  {flightInfo.departure.gate && (
                    <div>Gate {flightInfo.departure.gate}</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <p className="text-lg font-medium">{flightInfo.arrival.airport}</p>
              <p className="text-3xl font-bold mt-1">{flightInfo.arrival.time}</p>
              <p className="text-sm text-muted-foreground">{flightInfo.arrival.date}</p>
              {(flightInfo.arrival.terminal || flightInfo.arrival.gate) && (
                <div className="mt-2 flex items-center gap-4">
                  {flightInfo.arrival.terminal && (
                    <div className="flex items-center gap-1">
                      <Terminal className="h-4 w-4" />
                      <span>Terminal {flightInfo.arrival.terminal}</span>
                    </div>
                  )}
                  {flightInfo.arrival.gate && (
                    <div>Gate {flightInfo.arrival.gate}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Duration: {flightInfo.duration}</span>
            <span className="mx-2">•</span>
            <span>Last updated: {flightInfo.lastUpdated}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}