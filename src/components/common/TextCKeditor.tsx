import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import MyCustomUploadAdapterPlugin from '../../utils/ckeditorUploadAdapter';

interface TextCKeditorProps {
  data: string;
  onChange: (data: string) => void;
  config?: any;
}

const TextCKeditor: React.FC<TextCKeditorProps> = ({ data, onChange, config }) => {
  const defaultConfig = {
    extraPlugins: [MyCustomUploadAdapterPlugin],
    toolbar: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "numberedList",
      "bulletedList",
      "|",
      "link",
      "blockQuote",
      "|",
      "insertTable",
      "|",
      "undo",
      "redo",
      "|",
      "imageUpload",
    ],
    table: {
      contentToolbar: [
        "tableColumn",
        "tableRow",
        "mergeTableCells",
      ],
    },
    image: {
      toolbar: [
        'imageTextAlternative',
        '|',
        'imageStyle:alignLeft',
        'imageStyle:full',
        'imageStyle:alignRight'
      ],
    },
  };

  const editorConfig = config || defaultConfig;

  return (
    <>
      {/* @ts-ignore */}
      <CKEditor<ClassicEditor>
        editor={ClassicEditor}
        data={data}
        onChange={(event, editor) => onChange(editor.getData())}
        config={editorConfig}
      />
      <style>
        {`
          .ck-editor__editable {
            height: 300px !important;
            overflow: auto;
          }
          .ck-content img {
            width: 100px;
            height: auto;
          }
        `}
      </style>
    </>
  );
};

export default TextCKeditor;