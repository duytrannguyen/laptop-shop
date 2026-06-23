import React from 'react';
import { TreeManager } from './MenuManage';
import { LayoutTemplate } from 'lucide-react';

/* ─────────── THIẾT LẬP FOOTER ─────────── */
export default function FooterManage() {
  return (
    <TreeManager
      type="FOOTER"
      title="Thiết lập Footer"
      icon={<LayoutTemplate size={22} />}
      createLabel="Thêm mục"
    />
  );
}
