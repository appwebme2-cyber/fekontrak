
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Plus, Minus } from 'lucide-react';

interface CalculatorItem {
  id: string;
  nama_item: string;
  satuan: string;
  qty: number;
  harga_satuan: number;
}

export const UnitPriceCalculator = () => {
  const [items, setItems] = useState<CalculatorItem[]>([
    { id: '1', nama_item: '', satuan: 'unit', qty: 0, harga_satuan: 0 }
  ]);

  const totalValue = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.qty * item.harga_satuan), 0);
  }, [items]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const addItem = () => {
    const newItem: CalculatorItem = {
      id: Date.now().toString(),
      nama_item: '',
      satuan: 'unit',
      qty: 0,
      harga_satuan: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof CalculatorItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  return (
    <Card className="border-green-200 bg-green-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Calculator className="h-5 w-5" />
          Unit Price Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <Label htmlFor={`nama_item_${item.id}`} className="text-xs">Item Name</Label>
                  <Input
                    id={`nama_item_${item.id}`}
                    value={item.nama_item}
                    onChange={(e) => updateItem(item.id, 'nama_item', e.target.value)}
                    placeholder="Enter item name"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`qty_${item.id}`} className="text-xs">Quantity</Label>
                  <Input
                    id={`qty_${item.id}`}
                    type="number"
                    value={item.qty}
                    onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`satuan_${item.id}`} className="text-xs">Unit</Label>
                  <Select 
                    value={item.satuan} 
                    onValueChange={(value) => updateItem(item.id, 'satuan', value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit">Unit</SelectItem>
                      <SelectItem value="meter">Meter</SelectItem>
                      <SelectItem value="kg">Kilogram</SelectItem>
                      <SelectItem value="ton">Ton</SelectItem>
                      <SelectItem value="jam">Hour</SelectItem>
                      <SelectItem value="hari">Day</SelectItem>
                      <SelectItem value="lot">Lot</SelectItem>
                      <SelectItem value="set">Set</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`harga_${item.id}`} className="text-xs">Unit Price (IDR)</Label>
                  <Input
                    id={`harga_${item.id}`}
                    type="number"
                    value={item.harga_satuan}
                    onChange={(e) => updateItem(item.id, 'harga_satuan', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Item Total</Label>
                  <div className="h-9 flex items-center px-3 bg-gray-50 border rounded-md text-sm font-medium text-green-600">
                    {formatCurrency(item.qty * item.harga_satuan)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={addItem}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Contract Value</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalValue)}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            Save as Template
          </Button>
          <Button className="flex-1">
            Apply to Contract
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
