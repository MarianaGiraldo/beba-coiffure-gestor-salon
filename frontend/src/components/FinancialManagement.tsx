
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, DollarSign, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientPayment {
  pag_cli_id: number;
  fecha: string;
  monto: number;
  metodo: string;
  servicio: string;
  cliente: string;
}

interface Purchase {
  com_id: number;
  cop_fecha_compra: string;
  cop_total_compra: number;
  cop_metodo_pago: string;
  proveedor: string;
  productos: string;
}

interface EmployeePayment {
  pag_id: number;
  pag_fecha: string;
  pag_monto: number;
  pag_metodo: string;
  empleado: string;
}

const FinancialManagement = () => {
  const { toast } = useToast();
  
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([
    {
      pag_cli_id: 1,
      fecha: "2024-01-20",
      monto: 80000,
      metodo: "Efectivo",
      servicio: "Coloración Completa",
      cliente: "Ana Martínez"
    },
    {
      pag_cli_id: 2,
      fecha: "2024-01-20",
      monto: 25000,
      metodo: "Tarjeta",
      servicio: "Corte de Cabello",
      cliente: "Sofía López"
    },
    {
      pag_cli_id: 3,
      fecha: "2024-01-19",
      monto: 45000,
      metodo: "Nequi",
      servicio: "Tratamiento Facial",
      cliente: "Carmen Torres"
    }
  ]);

  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      com_id: 1,
      cop_fecha_compra: "2024-01-18",
      cop_total_compra: 450000,
      cop_metodo_pago: "Transferencia",
      proveedor: "Distribuidora Beauty Pro",
      productos: "Shampoo, Acondicionador, Tintes"
    },
    {
      com_id: 2,
      cop_fecha_compra: "2024-01-15",
      cop_total_compra: 200000,
      cop_metodo_pago: "Efectivo",
      proveedor: "Suministros Estética",
      productos: "Esmaltes, Lima de uñas"
    }
  ]);

  const [employeePayments, setEmployeePayments] = useState<EmployeePayment[]>([
    {
      pag_id: 1,
      pag_fecha: "2024-01-15",
      pag_monto: 1500000,
      pag_metodo: "Transferencia",
      empleado: "María González"
    },
    {
      pag_id: 2,
      pag_fecha: "2024-01-15",
      pag_monto: 1200000,
      pag_metodo: "Transferencia",
      empleado: "Carlos Rodríguez"
    }
  ]);

  const [newClientPayment, setNewClientPayment] = useState<Partial<ClientPayment>>({});
  const [newPurchase, setNewPurchase] = useState<Partial<Purchase>>({});
  const [isAddingClientPayment, setIsAddingClientPayment] = useState(false);
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);

  const handleAddClientPayment = () => {
    if (!newClientPayment.monto || !newClientPayment.metodo || !newClientPayment.servicio || !newClientPayment.cliente) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos del pago",
        variant: "destructive"
      });
      return;
    }

    const payment: ClientPayment = {
      pag_cli_id: Math.max(...clientPayments.map(p => p.pag_cli_id), 0) + 1,
      fecha: new Date().toISOString().split('T')[0],
      monto: newClientPayment.monto || 0,
      metodo: newClientPayment.metodo || "",
      servicio: newClientPayment.servicio || "",
      cliente: newClientPayment.cliente || ""
    };

    setClientPayments([...clientPayments, payment]);
    setNewClientPayment({});
    setIsAddingClientPayment(false);
    toast({
      title: "Pago registrado",
      description: "El pago del cliente ha sido registrado exitosamente"
    });
  };

  const handleAddPurchase = () => {
    if (!newPurchase.cop_total_compra || !newPurchase.cop_metodo_pago || !newPurchase.proveedor) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos de la compra",
        variant: "destructive"
      });
      return;
    }

    const purchase: Purchase = {
      com_id: Math.max(...purchases.map(p => p.com_id), 0) + 1,
      cop_fecha_compra: new Date().toISOString().split('T')[0],
      cop_total_compra: newPurchase.cop_total_compra || 0,
      cop_metodo_pago: newPurchase.cop_metodo_pago || "",
      proveedor: newPurchase.proveedor || "",
      productos: newPurchase.productos || ""
    };

    setPurchases([...purchases, purchase]);
    setNewPurchase({});
    setIsAddingPurchase(false);
    toast({
      title: "Compra registrada",
      description: "La compra ha sido registrada exitosamente"
    });
  };

  const getTotalIncome = () => {
    return clientPayments.reduce((total, payment) => total + payment.monto, 0);
  };

  const getTotalPurchases = () => {
    return purchases.reduce((total, purchase) => total + purchase.cop_total_compra, 0);
  };

  const getTotalSalaries = () => {
    return employeePayments.reduce((total, payment) => total + payment.pag_monto, 0);
  };

  const getNetProfit = () => {
    return getTotalIncome() - getTotalPurchases() - getTotalSalaries();
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: { [key: string]: string } = {
      "Efectivo": "bg-green-100 text-green-700",
      "Tarjeta": "bg-blue-100 text-blue-700",
      "Transferencia": "bg-purple-100 text-purple-700",
      "Nequi": "bg-yellow-100 text-yellow-700",
      "Daviplata": "bg-red-100 text-red-700"
    };
    return colors[method] || "bg-gray-100 text-gray-700";
  };

  const getCurrentMonthData = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyIncome = clientPayments
      .filter(p => new Date(p.fecha).getMonth() === currentMonth && new Date(p.fecha).getFullYear() === currentYear)
      .reduce((sum, p) => sum + p.monto, 0);
    
    const monthlyExpenses = purchases
      .filter(p => new Date(p.cop_fecha_compra).getMonth() === currentMonth && new Date(p.cop_fecha_compra).getFullYear() === currentYear)
      .reduce((sum, p) => sum + p.cop_total_compra, 0);

    const monthlySalaries = employeePayments
      .filter(p => new Date(p.pag_fecha).getMonth() === currentMonth && new Date(p.pag_fecha).getFullYear() === currentYear)
      .reduce((sum, p) => sum + p.pag_monto, 0);

    return {
      income: monthlyIncome,
      expenses: monthlyExpenses,
      salaries: monthlySalaries,
      profit: monthlyIncome - monthlyExpenses - monthlySalaries
    };
  };

  const monthlyData = getCurrentMonthData();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${monthlyData.income.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">pagos de clientes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos en Productos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${monthlyData.expenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">compras del mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salarios Pagados</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${monthlyData.salaries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">pagos de empleados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthlyData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${monthlyData.profit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">ganancia del mes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchases">Gastos en Productos</TabsTrigger>
          <TabsTrigger value="salaries">Pagos de Salarios</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientPayments.map((payment) => (
                    <TableRow key={payment.pag_cli_id}>
                      <TableCell>{payment.fecha}</TableCell>
                      <TableCell>{payment.cliente}</TableCell>
                      <TableCell>{payment.servicio}</TableCell>
                      <TableCell>${payment.monto.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentMethodColor(payment.metodo)}>
                          {payment.metodo}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Compras de Productos</h3>
            <Dialog open={isAddingPurchase} onOpenChange={setIsAddingPurchase}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Compra
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Compra de Productos</DialogTitle>
                  <DialogDescription>
                    Registra una nueva compra a proveedor
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="proveedor">Proveedor</Label>
                    <Input
                      id="proveedor"
                      value={newPurchase.proveedor || ""}
                      onChange={(e) => setNewPurchase({...newPurchase, proveedor: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="productos">Productos</Label>
                    <Input
                      id="productos"
                      value={newPurchase.productos || ""}
                      onChange={(e) => setNewPurchase({...newPurchase, productos: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="total">Total de la Compra</Label>
                    <Input
                      id="total"
                      type="number"
                      value={newPurchase.cop_total_compra || ""}
                      onChange={(e) => setNewPurchase({...newPurchase, cop_total_compra: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="metodo-pago">Método de Pago</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newPurchase.cop_metodo_pago || ""}
                      onChange={(e) => setNewPurchase({...newPurchase, cop_metodo_pago: e.target.value})}
                    >
                      <option value="">Seleccionar método</option>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Tarjeta">Tarjeta</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddPurchase}>Registrar Compra</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Método</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.com_id}>
                      <TableCell>{purchase.cop_fecha_compra}</TableCell>
                      <TableCell>{purchase.proveedor}</TableCell>
                      <TableCell>{purchase.productos}</TableCell>
                      <TableCell>${purchase.cop_total_compra.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentMethodColor(purchase.cop_metodo_pago)}>
                          {purchase.cop_metodo_pago}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salaries" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Pagos de Salarios</h3>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeePayments.map((payment) => (
                    <TableRow key={payment.pag_id}>
                      <TableCell>{payment.pag_fecha}</TableCell>
                      <TableCell>{payment.empleado}</TableCell>
                      <TableCell>${payment.pag_monto.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentMethodColor(payment.pag_metodo)}>
                          {payment.pag_metodo}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialManagement;
