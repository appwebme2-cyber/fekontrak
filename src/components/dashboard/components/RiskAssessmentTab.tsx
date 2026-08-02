import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Kontrak } from '@/types/database';
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  Coins,
  Users,
  Target,
  Calendar,
  Activity,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { navigateToContract } from '@/utils/navigationUtils';
import { getRiskEligibleContracts, getEligibleContracts } from '@/utils/contractEligibilityUtils';

interface RiskAssessmentTabProps {
  contracts: Kontrak[];
  onContractClick?: (contractId: string) => void;
}

interface RiskMetrics {
  criticalRisk: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  budgetOverrunRisk: number;
  scheduleDelayRisk: number;
  expiringContracts: number;
}

interface ContractRisk {
  contract: Kontrak;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number;
  riskFactors: string[];
  prediction: {
    budgetOverrun: number;
    delayDays: number;
    completionProbability: number;
  };
}

export const RiskAssessmentTab = ({ contracts, onContractClick }: RiskAssessmentTabProps) => {
  const navigate = useNavigate();
  
  // Calculate risk metrics and assessments with proper contract filtering
  const { riskMetrics, contractRisks, expiringContracts } = useMemo(() => {
    const today = new Date();
    const contractRisks: ContractRisk[] = [];
    
    // Get eligible contracts for different risk types
    const scheduleRiskContracts = getRiskEligibleContracts(contracts, 'schedule');
    const financialRiskContracts = getRiskEligibleContracts(contracts, 'financial');
    const amendmentRiskContracts = getRiskEligibleContracts(contracts, 'amendment');
    const generalEligibleContracts = getEligibleContracts(contracts, false);
    
    // Process all eligible contracts (Active and Pre-KOM)
    generalEligibleContracts.forEach(contract => {
      const riskFactors: string[] = [];
      let riskScore = 0;
      
      const progressActual = Number(contract.progress_actual) || 0;
      const progressPlan = Number(contract.progress_plan) || 0;
      const budgetUsed = (progressActual / 100) * (Number(contract.nilai_awal) || 0);
      const endDate = new Date(contract.tanggal_selesai || '');
      const daysToEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Schedule risk assessment - only for progress-eligible contracts
      const isScheduleEligible = scheduleRiskContracts.some(c => c.id_kontrak === contract.id_kontrak);
      if (isScheduleEligible && progressActual < progressPlan - 10) {
        riskFactors.push('Behind Schedule');
        riskScore += 25;
      }
      
      // Budget risk assessment - for financial-eligible contracts
      const isFinancialEligible = financialRiskContracts.some(c => c.id_kontrak === contract.id_kontrak);
      if (isFinancialEligible) {
        const budgetUtilization = progressActual > 0 ? (budgetUsed / (Number(contract.nilai_awal) || 1)) * 100 : 0;
        if (budgetUtilization > 90 && progressActual < 80) {
          riskFactors.push('Budget Overrun Risk');
          riskScore += 30;
        }
      }
      
      // Timeline risk assessment - for active contracts
      if (contract.status_kontrak === 'Aktif' || contract.status_kontrak === 'Active') {
        if (daysToEnd < 30 && progressActual < 90) {
          riskFactors.push('Timeline Risk');
          riskScore += 20;
        }
        
        // Contract expiry risk
        if (daysToEnd < 7) {
          riskFactors.push('Immediate Expiry');
          riskScore += 35;
        }
      }
      
      // Determine risk level
      let riskLevel: 'critical' | 'high' | 'medium' | 'low';
      if (riskScore >= 70) riskLevel = 'critical';
      else if (riskScore >= 50) riskLevel = 'high';
      else if (riskScore >= 25) riskLevel = 'medium';
      else riskLevel = 'low';
      
      // Predictive calculations
      const budgetUtilization = progressActual > 0 ? (budgetUsed / (Number(contract.nilai_awal) || 1)) * 100 : 0;
      const budgetOverrunPrediction = Math.max(0, (budgetUtilization - 100));
      const delayPrediction = Math.max(0, (progressPlan - progressActual) * 2);
      const completionProbability = Math.min(100, Math.max(0, 100 - riskScore));
      
      contractRisks.push({
        contract,
        riskLevel,
        riskScore,
        riskFactors,
        prediction: {
          budgetOverrun: budgetOverrunPrediction,
          delayDays: delayPrediction,
          completionProbability
        }
      });
    });
    
    // Calculate aggregated metrics
    const riskMetrics: RiskMetrics = {
      criticalRisk: contractRisks.filter(cr => cr.riskLevel === 'critical').length,
      highRisk: contractRisks.filter(cr => cr.riskLevel === 'high').length,
      mediumRisk: contractRisks.filter(cr => cr.riskLevel === 'medium').length,
      lowRisk: contractRisks.filter(cr => cr.riskLevel === 'low').length,
      budgetOverrunRisk: contractRisks.filter(cr => cr.riskFactors.includes('Budget Overrun Risk')).length,
      scheduleDelayRisk: contractRisks.filter(cr => cr.riskFactors.includes('Behind Schedule')).length,
      expiringContracts: contractRisks.filter(cr => cr.riskFactors.includes('Immediate Expiry')).length,
    };
    
    const expiringContracts = contractRisks
      .filter(cr => cr.riskFactors.includes('Timeline Risk') || cr.riskFactors.includes('Immediate Expiry'))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
    
    return { riskMetrics, contractRisks: contractRisks.sort((a, b) => b.riskScore - a.riskScore), expiringContracts };
  }, [contracts]);
  
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  const getRiskBorderColor = (level: string) => {
    switch (level) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'high': return 'border-orange-200 bg-orange-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Critical Risk</p>
                <p className="text-2xl font-bold text-red-700">{riskMetrics.criticalRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">High Risk</p>
                <p className="text-2xl font-bold text-orange-700">{riskMetrics.highRisk}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Budget Risk</p>
                <p className="text-2xl font-bold text-blue-700">{riskMetrics.budgetOverrunRisk}</p>
              </div>
              <Coins className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Schedule Risk</p>
                <p className="text-2xl font-bold text-purple-700">{riskMetrics.scheduleDelayRisk}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts at Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              High Risk Contracts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contractRisks.filter(cr => cr.riskLevel === 'critical' || cr.riskLevel === 'high').slice(0, 5).map((risk) => (
              <div 
                key={risk.contract.id_kontrak}
                className={`group p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getRiskBorderColor(risk.riskLevel)}`}
                onClick={() => {
                  if (onContractClick) {
                    onContractClick(risk.contract.id_kontrak);
                  } else {
                    navigateToContract(navigate, risk.contract.id_kontrak);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <h4 className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                      {risk.contract.judul_kontrak.length > 40 
                        ? `${risk.contract.judul_kontrak.substring(0, 40)}...` 
                        : risk.contract.judul_kontrak}
                    </h4>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                  </div>
                  <Badge className={getRiskColor(risk.riskLevel)} variant="secondary">
                    {risk.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Risk Score</span>
                    <span className="font-semibold">{risk.riskScore}/100</span>
                  </div>
                  <Progress value={risk.riskScore} className="h-2" />
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {risk.riskFactors.map((factor, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                  
                  {risk.prediction.budgetOverrun > 0 && (
                    <div className="text-xs text-red-600">
                      Predicted Budget Overrun: {risk.prediction.budgetOverrun.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {contractRisks.filter(cr => cr.riskLevel === 'critical' || cr.riskLevel === 'high').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No high-risk contracts detected</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contracts Nearing Expiry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              Contracts Nearing Expiry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {expiringContracts.map((risk) => {
              const endDate = new Date(risk.contract.tanggal_selesai || '');
              const today = new Date();
              const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div 
                  key={risk.contract.id_kontrak}
                  className="group p-4 rounded-lg border border-orange-200 bg-orange-50 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    if (onContractClick) {
                      onContractClick(risk.contract.id_kontrak);
                    } else {
                      navigateToContract(navigate, risk.contract.id_kontrak);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <h4 className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                        {risk.contract.judul_kontrak.length > 40 
                          ? `${risk.contract.judul_kontrak.substring(0, 40)}...` 
                          : risk.contract.judul_kontrak}
                      </h4>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                    </div>
                    <Badge variant={daysRemaining < 7 ? "destructive" : "secondary"}>
                      {daysRemaining} days left
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progress</span>
                      <span>{Number(risk.contract.progress_actual) || 0}%</span>
                    </div>
                    <Progress value={Number(risk.contract.progress_actual) || 0} className="h-2" />
                    
                    <div className="text-xs text-orange-700">
                      Completion Probability: {risk.prediction.completionProbability.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
            
            {expiringContracts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No contracts nearing expiry</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risk Summary Alert */}
      {riskMetrics.criticalRisk > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Action Required:</strong> {riskMetrics.criticalRisk} contract(s) are at critical risk and require immediate attention. 
            {riskMetrics.budgetOverrunRisk > 0 && ` ${riskMetrics.budgetOverrunRisk} contract(s) show budget overrun risk.`}
            {riskMetrics.expiringContracts > 0 && ` ${riskMetrics.expiringContracts} contract(s) are expiring soon.`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};