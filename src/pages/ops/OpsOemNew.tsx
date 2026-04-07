import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OpsLayout } from "@/components/ops/OpsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const cities = ["Bangalore", "Mumbai", "Chennai", "Delhi", "Hyderabad", "Pune", "Kolkata"];
const brands = ["Honda", "TVS", "Bajaj", "Royal Enfield", "Hero", "Yamaha", "Suzuki", "KTM", "Other"];

export default function OpsOemNew() {
  const navigate = useNavigate();
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("OEM registered. Awaiting KYC documents.");
    navigate("/ops/entities/oem");
  };

  return (
    <OpsLayout>
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/ops/entities/oem")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Register New OEM</h1>
            <p className="text-sm text-muted-foreground">Add a new OEM organization to the platform</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader><CardTitle className="text-base">Company Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Company Name *</Label>
                  <Input placeholder="Legal registered name" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Trade Name</Label>
                  <Input placeholder="If different from legal name" />
                </div>
                <div className="space-y-1.5">
                  <Label>GST Number *</Label>
                  <Input placeholder="15-char GSTIN" required maxLength={15} />
                </div>
                <div className="space-y-1.5">
                  <Label>PAN Number *</Label>
                  <Input placeholder="AAAAA9999A" required maxLength={10} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Registered Address *</Label>
                <Textarea placeholder="Full address including PIN code" required />
              </div>
              <div className="space-y-1.5">
                <Label>Primary City *</Label>
                <Select required>
                  <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader><CardTitle className="text-base">Authorized Signatory</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Name *</Label>
                  <Input placeholder="Full name" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Designation *</Label>
                  <Input placeholder="e.g. Director, Proprietor" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone *</Label>
                  <Input placeholder="10-digit mobile" required maxLength={10} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input type="email" placeholder="email@example.com" required />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader><CardTitle className="text-base">Business Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Brands *</Label>
                <div className="flex flex-wrap gap-2">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => toggleBrand(brand)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        selectedBrands.includes(brand)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Estimated Monthly Volume</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 vehicles/month</SelectItem>
                    <SelectItem value="11-50">11-50 vehicles/month</SelectItem>
                    <SelectItem value="51-100">51-100 vehicles/month</SelectItem>
                    <SelectItem value="100+">100+ vehicles/month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea placeholder="Internal notes about the OEM" />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 mt-4">
            <Button type="submit">Register OEM</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/ops/entities/oem")}>Cancel</Button>
          </div>
        </form>
      </div>
    </OpsLayout>
  );
}
