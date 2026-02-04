import { 
  PlusCircle, 
  Circle, 
  GitCommitHorizontal, 
  Cylinder, 
  ArrowRightCircle, 
  Trash2, 
  RotateCcw, 
  Download, 
  Save, 
  Upload, 
  MousePointer2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNetworkStore } from '@/lib/store';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

export function Toolbar({ onExport, onSave, onLoad }: { onExport: () => void, onSave: () => void, onLoad: () => void }) {
  const { addNode, clearNetwork, selectedElementId } = useNetworkStore();

  const tools = [
    { label: 'Reservoir', icon: Cylinder, action: () => addNode('reservoir', { x: 100, y: 100 }), color: 'text-blue-600' },
    { label: 'Node', icon: Circle, action: () => addNode('node', { x: 150, y: 150 }), color: 'text-slate-600' },
    { label: 'Junction', icon: GitCommitHorizontal, action: () => addNode('junction', { x: 200, y: 150 }), color: 'text-red-600' },
    { label: 'Surge Tank', icon: PlusCircle, action: () => addNode('surgeTank', { x: 250, y: 100 }), color: 'text-orange-600' },
    { label: 'Flow BC', icon: ArrowRightCircle, action: () => addNode('flowBoundary', { x: 50, y: 150 }), color: 'text-green-600' },
  ];

  return (
    <div className="h-16 border-b border-border bg-card px-4 flex items-center justify-between shadow-sm z-10 relative">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 data-[active=true]:bg-accent">
                <MousePointer2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Select / Move</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-8 mx-2" />

        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Tooltip key={tool.label}>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={tool.action}
                  className="gap-2 h-9 px-3 hover:bg-muted/50 transition-colors"
                >
                  <tool.icon className={`w-4 h-4 ${tool.color}`} />
                  <span className="hidden xl:inline">{tool.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add {tool.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={clearNetwork} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear Canvas</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-8 mx-2" />

        <div className="flex items-center gap-1">
           <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="sm" onClick={onLoad}>
                <Upload className="w-4 h-4 mr-2" />
                Load
              </Button>
            </TooltipTrigger>
            <TooltipContent>Load JSON Project</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="sm" onClick={onSave}>
                <Save className="w-4 h-4 mr-2" />
                Save JSON
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save Project State</TooltipContent>
          </Tooltip>

          <Button onClick={onExport} className="ml-2 shadow-lg shadow-primary/20">
            <Download className="w-4 h-4 mr-2" />
            Generate .INP
          </Button>
        </div>
      </div>
    </div>
  );
}
