
import React, { useState } from 'react';
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
  
  const applyFormat = (format: string) => {
    // Get the current selection
    const selection = window.getSelection();
    if (!selection || !selection.toString()) return;
    
    // Get the currently selected text
    const selectedText = selection.toString();
    
    // Determine the format to apply
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'alignLeft':
        formattedText = `<div style="text-align: left;">${selectedText}</div>`;
        break;
      case 'alignCenter':
        formattedText = `<div style="text-align: center;">${selectedText}</div>`;
        break;
      case 'alignRight':
        formattedText = `<div style="text-align: right;">${selectedText}</div>`;
        break;
      case 'unorderedList':
        formattedText = `<ul>\n  <li>${selectedText.split('\n').join('</li>\n  <li>')}</li>\n</ul>`;
        break;
      case 'orderedList':
        formattedText = `<ol>\n  <li>${selectedText.split('\n').join('</li>\n  <li>')}</li>\n</ol>`;
        break;
      case 'link':
        const url = prompt('Enter URL:', 'https://');
        if (url) {
          formattedText = `<a href="${url}" target="_blank" rel="noopener noreferrer">${selectedText}</a>`;
        } else {
          return;
        }
        break;
      default:
        formattedText = selectedText;
    }
    
    // Replace the selected text with the formatted text in the editor
    const before = value.substring(0, selection.anchorOffset);
    const after = value.substring(selection.focusOffset);
    onChange(before + formattedText + after);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !onImageUpload) return;
    
    const file = event.target.files[0];
    try {
      const imageUrl = await onImageUpload(file);
      if (imageUrl) {
        const imageTag = `<img src="${imageUrl}" alt="Blog image" class="my-4 rounded-lg max-w-full h-auto" />`;
        onChange(value + '\n' + imageTag);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  
  const renderHTML = () => {
    return { __html: value };
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
                onClick={() => applyFormat('bold')}
              >
                <Bold size={16} />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => applyFormat('italic')}
              >
                <Italic size={16} />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => applyFormat('underline')}
              >
                <Underline size={16} />
              </Button>
              <span className="mx-1 text-gray-300">|</span>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => applyFormat('alignLeft')}
              >
                <AlignLeft size={16} />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => applyFormat('alignCenter')}
              >
                <AlignCenter size={16} />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => applyFormat('alignRight')}
              >
                <AlignRight size={16} />
              </Button>
              <span className="mx-1 text-gray-300">|</span>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => applyFormat('unorderedList')}
              >
                <List size={16} />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => applyFormat('orderedList')}
              >
                <ListOrdered size={16} />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => applyFormat('link')}
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
        
        <TabsContent value="visual" className="p-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="relative">
            <div 
              className="min-h-[300px] max-h-[500px] overflow-y-auto p-4 prose prose-sm max-w-none focus:outline-none"
              contentEditable
              dangerouslySetInnerHTML={renderHTML()}
              onInput={(e) => onChange(e.currentTarget.innerHTML)}
            />
          </div>
        </TabsContent>
        
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
