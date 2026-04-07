import { useNavigate } from "react-router-dom";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { SLAPill } from "./SLAPill";
import type { QueueHealthRow } from "@/data/opsMockData";

interface Props {
  data: QueueHealthRow[];
}

export function QueueHealthTable({ data }: Props) {
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Queue Health</h3>
        <p className="text-xs text-muted-foreground">Real-time status of every operational queue</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Queue</TableHead>
            <TableHead>Module</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Assigned</TableHead>
            <TableHead className="text-center">Unassigned</TableHead>
            <TableHead className="text-center">On Track</TableHead>
            <TableHead className="text-center">Warning</TableHead>
            <TableHead className="text-center">Overdue</TableHead>
            <TableHead className="text-right">Avg Resolution</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.queue}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(row.link)}
            >
              <TableCell className="font-medium">{row.queue}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{row.module}</TableCell>
              <TableCell className="text-center font-semibold">{row.total}</TableCell>
              <TableCell className="text-center">{row.assigned}</TableCell>
              <TableCell className="text-center">
                {row.unassigned > 0 ? (
                  <span className="text-red-600 font-semibold">{row.unassigned}</span>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="text-center"><SLAPill count={row.onTrack} type="onTrack" /></TableCell>
              <TableCell className="text-center"><SLAPill count={row.warning} type="warning" /></TableCell>
              <TableCell className="text-center"><SLAPill count={row.overdue} type="overdue" /></TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">{row.avgResolutionTime}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
