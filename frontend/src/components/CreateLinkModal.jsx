import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Link2, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCreateLink } from '@/hooks/useLinks';

const createLinkSchema = z.object({
  originalUrl: z.string().url('Please enter a valid URL (e.g., https://example.com)'),
  customAlias: z.string()
    .regex(/^[a-zA-Z0-9_-]*$/, 'Only letters, numbers, hyphens, and underscores')
    .max(20, 'Alias must be 20 characters or less')
    .optional()
    .or(z.literal('')),
  expiryDate: z.string().optional().or(z.literal('')),
});

export function CreateLinkModal({ isOpen, onClose }) {
  const createLinkMutation = useCreateLink();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      originalUrl: '',
      customAlias: '',
      expiryDate: '',
    }
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      // Remove empty strings before sending to backend
      const payload = {
        originalUrl: data.originalUrl,
        customAlias: data.customAlias || undefined,
        expiryDate: data.expiryDate || undefined,
      };
      
      await createLinkMutation.mutateAsync(payload);
      reset();
      onClose();
    } catch (error) {
      setServerError(error.response?.data?.message || 'Failed to create link. Alias might be taken.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg"
          >
            <Card className="glass relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Link2 className="w-5 h-5 text-primary" />
                  Create New Short Link
                </CardTitle>
                <CardDescription>
                  Shorten your URL and optionally customize it.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {serverError && (
                    <div className="p-3 text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-md">
                      {serverError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Destination URL *</label>
                    <Input 
                      placeholder="https://very-long-url.com/..." 
                      error={errors.originalUrl?.message}
                      {...register('originalUrl')} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Custom Alias
                      </label>
                      <Input 
                        placeholder="my-link" 
                        error={errors.customAlias?.message}
                        {...register('customAlias')} 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Expiry Date
                      </label>
                      <Input 
                        type="date" 
                        error={errors.expiryDate?.message}
                        {...register('expiryDate')} 
                      />
                    </div>
                  </div>
                </CardContent>

                <div className="p-6 pt-0 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLinkMutation.isPending}>
                    {createLinkMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Create Link
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}