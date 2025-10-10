/* eslint-disable max-params */
import { JSX, useState } from 'react';
import { Pencil, Trash, Plus } from 'lucide-react';
import PxBorder from '@/components/px-border';
import FocusRing from '@/components/focus-ring';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from './ui/button';
import { useForm } from 'react-hook-form';

export type Tier = {
  id: string | number;
  name: string;
  features: string[];
  price: number | string;
};

type TiersProps = {
  tiers: Tier[];
  trigger?: React.ReactNode;
};

type TierFormData = {
  name: string;
  price: string;
  features: string[];
};

type TierFormProps = {
  initialData?: Partial<TierFormData>;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (data: TierFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

/**
 * Tier form component for adding/editing tiers.
 *
 * @param props - The props for the TierForm component
 * @param props.initialData - Optional initial data for the form
 * @param props.onSubmit - Callback when form is submitted
 * @param props.onCancel - Callback when form is cancelled
 * @param props.isSubmitting - Whether the form is currently submitting
 * @returns The rendered tier form component
 */
const TierForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TierFormProps): JSX.Element => {
  const form = useForm<TierFormData>({
    defaultValues: {
      name: initialData?.name || '',
      price: initialData?.price || '',
      features: initialData?.features || [''],
    },
  });

  /**
   * Handles form submission.
   *
   * @param data - The form data
   */
  const handleSubmit = (data: TierFormData): void => {
    // Filter out empty features before submitting
    const filteredData = {
      ...data,
      features: data.features.filter((feature) => feature.trim() !== ''),
    };
    onSubmit(filteredData);
  };

  const isFormChanged = form.formState.isDirty;

  // Helper functions for feature management
  /**
   * Updates a feature at the specified index.
   *
   * @param params - Object containing index and value
   * @param params.index - The index of the feature to update
   * @param params.value - The new value for the feature
   */
  const updateFeature = (params: { index: number; value: string }): void => {
    const newFeatures = [...form.getValues('features')];
    newFeatures[params.index] = params.value;
    form.setValue('features', newFeatures, { shouldDirty: true });
  };

  /**
   * Removes a feature at the specified index.
   *
   * @param index - The index of the feature to remove
   */
  const removeFeature = (index: number): void => {
    const currentFeatures = form.getValues('features');
    const newFeatures: string[] = [];
    for (let i = 0; i < currentFeatures.length; i++) {
      if (i !== index) {
        newFeatures.push(currentFeatures[i]);
      }
    }
    form.setValue('features', newFeatures, { shouldDirty: true });
  };

  /**
   * Adds a new empty feature to the list.
   */
  const addFeature = (): void => {
    const currentFeatures = form.getValues('features');
    form.setValue('features', [...currentFeatures, ''], { shouldDirty: true });
  };

  /**
   * Renders feature inputs.
   *
   * @param features - Array of feature strings
   * @returns Array of JSX elements
   */
  const renderFeatureInputs = (features: string[]): JSX.Element[] => {
    const result: JSX.Element[] = [];
    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      const index = i;

      /**
       * Handles input change for a feature.
       *
       * @param e - The input change event
       */
      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        updateFeature({ index, value: e.target.value });
      };

      /**
       * Handles remove button click for a feature.
       */
      const handleRemoveClick = (): void => {
        removeFeature(index);
      };

      result.push(
        <div key={index} className="flex gap-2">
          <Input
            containerClassName="flex-grow"
            placeholder="Enter feature"
            value={feature}
            onChange={handleInputChange}
          />
          {features.length > 1 && (
            <Button
              type="button"
              size="icon"
              shadow={false}
              variant="destructive"
              onClick={handleRemoveClick}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>,
      );
    }
    return result;
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tier Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter tier name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price ($)</FormLabel>
              <FormControl>
                <Input placeholder="Enter price" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Features</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {renderFeatureInputs(field.value)}
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-[calc(100%-6px)]"
                    size="sm"
                    shadow={false}
                    onClick={addFeature}
                  >
                    Add Feature
                    <Plus />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isFormChanged || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

/**
 * Render a grid of membership tiers with a leading "Manage tiers" card.
 * All tier operations (manage, edit) are handled internally within this component.
 *
 * @param root0 Destructured props
 * @param root0.tiers List of tiers to display
 * @param root0.trigger Optional custom trigger element for the manage dialog
 * @returns JSX element containing the tiers grid with internal operation handlers
 */
const Tiers = ({ tiers, trigger }: TiersProps): JSX.Element => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles opening the edit dialog for a tier.
   *
   * @param tier - The tier to edit
   */
  const handleEditTier = (tier: Tier): void => {
    setSelectedTier(tier);
    setEditDialogOpen(true);
  };

  /**
   * Handles opening the delete confirmation dialog for a tier.
   *
   * @param tier - The tier to delete
   */
  const handleDeleteTier = (tier: Tier): void => {
    setSelectedTier(tier);
    setDeleteDialogOpen(true);
  };

  /**
   * Handles opening the add tier dialog.
   */
  const handleAddTier = (): void => {
    setSelectedTier(null);
    setAddDialogOpen(true);
  };

  /**
   * Handles submitting the edit form.
   *
   * @param data - The form data
   */
  const handleEditSubmit = async (data: TierFormData): Promise<void> => {
    if (!selectedTier) return;

    setIsSubmitting(true);
    try {
      // Here you would typically make an API call to update the tier
      console.log('Updating tier:', selectedTier.id, data);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setEditDialogOpen(false);
      setSelectedTier(null);
    } catch (error) {
      console.error('Error updating tier:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles submitting the add form.
   *
   * @param data - The form data
   */
  const handleAddSubmit = async (data: TierFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      // Here you would typically make an API call to create the tier
      console.log('Creating tier:', data);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAddDialogOpen(false);
    } catch (error) {
      console.error('Error creating tier:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles confirming the deletion of a tier.
   */
  const handleDeleteConfirm = async (): Promise<void> => {
    if (!selectedTier) return;

    setIsSubmitting(true);
    try {
      // Here you would typically make an API call to delete the tier
      console.log('Deleting tier:', selectedTier.id);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setDeleteDialogOpen(false);
      setSelectedTier(null);
    } catch (error) {
      console.error('Error deleting tier:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {trigger || (
            <button className="bg-secondary-primary group relative flex cursor-pointer flex-col gap-4 px-5 py-20 outline-none">
              <PxBorder width={3} radius="lg" />
              <FocusRing width={3} />
              <div className="flex h-full flex-col items-center justify-center gap-5 text-center text-black">
                <Pencil strokeWidth={1.5} size={70} />
                <h2 className="text-3xl">Manage tiers</h2>
              </div>
            </button>
          )}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Manage tiers</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="mb-5 flex flex-col gap-3">
            {tiers.map((tier) => (
              <div key={tier.id} className="flex items-center justify-between">
                <h3 className="text-lg">{tier.name}</h3>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    shadow={false}
                    variant="secondary"
                    onClick={() => handleEditTier(tier)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    size="icon"
                    shadow={false}
                    variant="destructive"
                    onClick={() => handleDeleteTier(tier)}
                  >
                    <Trash />
                  </Button>
                </div>
              </div>
            ))}
            <Button shadow={false} variant="secondary" onClick={handleAddTier}>
              Add tier
              <Plus />
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Tier Dialog */}
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Tier</AlertDialogTitle>
          </AlertDialogHeader>
          <TierForm
            initialData={
              selectedTier
                ? {
                    name: selectedTier.name,
                    price: selectedTier.price.toString(),
                    features: selectedTier.features,
                  }
                : undefined
            }
            onSubmit={handleEditSubmit}
            onCancel={() => setEditDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Tier Dialog */}
      <AlertDialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Tier</AlertDialogTitle>
          </AlertDialogHeader>
          <TierForm
            onSubmit={handleAddSubmit}
            onCancel={() => setAddDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the tier "{selectedTier?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {tiers.map((tier) => (
        <div
          key={tier.id}
          className="bg-secondary-primary relative flex h-full flex-col justify-between gap-4 p-5"
        >
          <PxBorder width={3} radius="lg" />
          <FocusRing width={3} />
          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <h3 className="text-2xl">{tier.name}</h3>
              <div className="flex flex-col items-end gap-[5px]">
                <p className="text-4xl font-bold">{tier.price}$</p>
                <p className="text-base">per month</p>
              </div>
            </div>
            <ul className="flex [list-style-type:square] flex-col gap-2 pl-5">
              {tier.features.map((feature, index) => (
                <li key={index} className="text-sm">
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </>
  );
};

export default Tiers;
