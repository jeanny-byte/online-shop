import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, 
  AlignRight, List, ListOrdered, Link, ImageIcon
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string | null>;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, onImageUpload }) => {
  const [activeTab, setActiveTab] = useState<string>('visual');
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'visual' && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value, activeTab]);

  const applyFormat = (format: string) => {
    document.execCommand('styleWithCSS', false, undefined);
    document.execCommand(format, false);

    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleLink = () => {
    const url = prompt('Enter URL:', 'https://');
    if (url) {
      document.execCommand('createLink', false, url);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const applyList = (format: 'insertUnorderedList' | 'insertOrderedList') => {
    document.execCommand('styleWithCSS', false, undefined);
    document.execCommand(format, false, undefined);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const applyAlignment = (alignment: 'justifyLeft' | 'justifyCenter' | 'justifyRight') => {
    document.execCommand(alignment, false);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !onImageUpload) return;
    
    const file = event.target.files[0];
    try {
      const imageUrl = await onImageUpload(file);
      if (imageUrl) {
        const imageTag = `<img src="${imageUrl}" alt="Blog image" style="my-4 rounded-lg max-w-full h-auto" />`;
        document.execCommand('insertHTML', false, imageTag);
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };

  return (
    <div className="border rounded-md">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b p-2">
          <TabsList>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
          </TabsList>
          
          {activeTab === 'visual' && (
            <div className="flex items-center space-x-1">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onMouseDown={(e) => e.preventDefault()} // Prevent editor losing focus
                onClick={() => applyFormat('bold')}
              >
                <Bold size={16} />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('italic')}
              >
                <Italic size={16} />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('underline')}
              >
                <Underline size={16} />
              </Button>
              <span className="mx-1 text-gray-300">|</span>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyAlignment('justifyLeft')}
              >
                <AlignLeft size={16} />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyAlignment('justifyCenter')}
              >
                <AlignCenter size={16} />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyAlignment('justifyRight')}
              >
                <AlignRight size={16} />
              </Button>
              <span className="mx-1 text-gray-300">|</span>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyList('insertUnorderedList')}
              >
                <List size={16} />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyList('insertOrderedList')}
              >
                <ListOrdered size={16} />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleLink}
              >
                <Link size={16} />
              </Button>
              <label htmlFor="image-upload" className="cursor-pointer">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  asChild
                >
                  <span>
                    <ImageIcon size={16} />
                  </span>
                </Button>
                <input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </label>
            </div>
          )}
        </div>
        
        <div style={{ display: activeTab === 'visual' ? 'block' : 'none' }}>
          <div 
            ref={editorRef}
            className="min-h-[300px] max-h-[500px] overflow-y-auto p-4 prose prose-sm max-w-none focus:outline-none"
            contentEditable
            onInput={handleInput}
          />
        </div>
        
        <TabsContent value="html" className="p-0">
          <Textarea 
            className="min-h-[300px] max-h-[500px] p-4 font-mono text-sm border-0 rounded-none focus-visible:ring-0"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RichTextEditor;
