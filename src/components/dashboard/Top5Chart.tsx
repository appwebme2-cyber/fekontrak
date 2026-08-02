
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingDown, TrendingUp, Eye } from 'lucide-react';

interface Top5ChartProps {
  data: {
    lowest: Array<{
      name: string;
      fullName?: string;
      progress: number;
      planProgress?: number;
      contractId?: string;
      endDate?: string;
      category?: string;
    }>;
    behind: Array<{
      name: string;
      fullName?: string;
      progress: number;
      planProgress?: number;
      contractId?: string;
      endDate?: string;
      behindPercentage?: number;
      category?: string;
    }>;
  };
  onContractClick?: (contractId: string) => void;
}

export const Top5Chart = ({ data, onContractClick }: Top5ChartProps) => {
  // Use the pre-processed data from InteractiveDashboard
  const sortedByProgress = data.lowest || [];
  const behindContracts = data.behind || [];

  return (
    <div className="space-y-6">
      {/* Top 5 Kontrak dengan Progress Terendah */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-800">
                  Top 5 Kontrak (Progress Terendah)
                </CardTitle>
                <p className="text-sm text-gray-600">Kontrak dengan progress paling rendah</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedByProgress.length > 0 ? (
            sortedByProgress.map((item, index) => (
              <div 
                key={index}
                className="group p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => item.contractId && onContractClick?.(item.contractId)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
                      {item.fullName || item.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Badge className="bg-red-100 text-red-700 border-red-200 font-bold">
                      #{index + 1}
                    </Badge>
                    {item.contractId && onContractClick && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onContractClick(item.contractId!);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress Aktual</span>
                    <span className="font-bold text-red-600">{Math.round(item.progress)}%</span>
                  </div>
                  <Progress 
                    value={item.progress} 
                    className="h-3 bg-red-200" 
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingDown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Tidak ada data kontrak</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 5 Kontrak dengan Progress Behind Tertinggi */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-800">
                  Top 5 Kontrak (Progress Behind Tertinggi)
                </CardTitle>
                <p className="text-sm text-gray-600">Kontrak dengan keterlambatan terbesar</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {behindContracts.length > 0 ? (
            behindContracts.map((item, index) => (
              <div 
                key={index}
                className="group p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => item.contractId && onContractClick?.(item.contractId)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
                      {item.fullName || item.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                     <Badge className="bg-orange-100 text-orange-700 border-orange-200 font-bold">
                       -{Math.round(item.behindPercentage || 0)}%
                     </Badge>
                    {item.contractId && onContractClick && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onContractClick(item.contractId!);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-gray-800">
                      {Math.round(item.progress)}% / {Math.round(item.planProgress || 0)}%
                    </span>
                  </div>
                  
                  <div className="relative">
                    {/* Background progress bar (target) */}
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-orange-300 h-3 rounded-full" 
                        style={{ width: `${Math.min(item.planProgress || 0, 100)}%` }}
                      />
                    </div>
                    {/* Actual progress bar */}
                    <div className="absolute top-0 w-full bg-transparent rounded-full h-3">
                      <div 
                        className="bg-orange-600 h-3 rounded-full" 
                        style={{ width: `${Math.min(item.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Aktual: {Math.round(item.progress)}%</span>
                    <span>Target: {Math.round(item.planProgress || 0)}%</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Tidak ada kontrak yang tertinggal</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
