import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCollaborativeEditing } from '@/hooks/useCollaborativeEditing';
import { cn } from '@/lib/utils';
import { Users, AlertTriangle } from 'lucide-react';

interface CollaborativeFieldProps {
  recordType: string;
  recordId: string;
  fieldName: string;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  type?: 'input' | 'textarea' | 'number';
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CollaborativeField = ({
  recordType,
  recordId,
  fieldName,
  value,
  onChange,
  onBlur,
  type = 'input',
  placeholder,
  className,
  disabled
}: CollaborativeFieldProps) => {
  const {
    announceFieldEditing,
    stopFieldEditing,
    isFieldBeingEdited,
    getFieldEditors,
    optimisticUpdate,
    conflicts
  } = useCollaborativeEditing(recordType, recordId);

  const [localValue, setLocalValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [remotePreview, setRemotePreview] = useState<any>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const isBeingEdited = isFieldBeingEdited(fieldName);
  const fieldEditors = getFieldEditors(fieldName);
  const hasConflict = conflicts.some(c => c.fieldName === fieldName);

  // Sync local value with prop value
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
    }
  }, [value, isEditing]);

  // Listen for remote changes
  useEffect(() => {
    const handleRemoteChange = (event: CustomEvent) => {
      const { fieldName: changedField, value: changedValue } = event.detail;
      if (changedField === fieldName) {
        setRemotePreview(changedValue);
        // Clear preview after 3 seconds
        setTimeout(() => setRemotePreview(null), 3000);
      }
    };

    window.addEventListener('collaborative_field_change' as any, handleRemoteChange);
    return () => {
      window.removeEventListener('collaborative_field_change' as any, handleRemoteChange);
    };
  }, [fieldName]);

  const handleFocus = () => {
    setIsEditing(true);
    announceFieldEditing(fieldName);
  };

  const handleBlur = () => {
    setIsEditing(false);
    stopFieldEditing();
    onBlur?.();
  };

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);

    // Debounce the actual onChange call
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      optimisticUpdate(fieldName, newValue, async () => {
        onChange(newValue);
        return newValue;
      });
    }, 500); // 500ms debounce
  };

  const renderInput = () => {
    const commonProps = {
      value: remotePreview !== null ? remotePreview : localValue,
      onChange: (e: any) => handleChange(e.target.value),
      onFocus: handleFocus,
      onBlur: handleBlur,
      placeholder,
      disabled: disabled || isBeingEdited,
      className: cn(
        className,
        isBeingEdited && 'border-orange-300 bg-orange-50',
        hasConflict && 'border-red-300 bg-red-50',
        remotePreview !== null && 'border-blue-300 bg-blue-50'
      )
    };

    switch (type) {
      case 'textarea':
        return <Textarea {...commonProps} />;
      case 'number':
        return <Input {...commonProps} type="number" />;
      default:
        return <Input {...commonProps} />;
    }
  };

  return (
    <div className="relative">
      {renderInput()}
      
      {/* Active editors indicator */}
      {isBeingEdited && (
        <div className="absolute -top-2 right-0 flex gap-1">
          <TooltipProvider>
            {fieldEditors.map((editor, index) => (
              <Tooltip key={editor.userId}>
                <TooltipTrigger>
                  <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={editor.avatar} />
                      <AvatarFallback className="text-xs">
                        {editor.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Users className="w-3 h-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{editor.userName} sedang mengedit field ini</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      )}

      {/* Conflict indicator */}
      {hasConflict && (
        <div className="absolute -top-2 left-0">
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Konflik
          </Badge>
        </div>
      )}

      {/* Remote preview indicator */}
      {remotePreview !== null && (
        <div className="absolute -bottom-6 left-0 right-0">
          <Badge variant="secondary" className="text-xs">
            Preview: {String(remotePreview).substring(0, 30)}...
          </Badge>
        </div>
      )}
    </div>
  );
};