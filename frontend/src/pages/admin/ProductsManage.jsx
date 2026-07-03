import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { Package, Plus, Search, ArrowLeft, Edit2, Trash2, Image, Link2, Eye, EyeOff, Calendar, Hash, Tag, FileText, Globe, Upload, ChevronDown, Bold, Italic, Underline as UnderlineIcon, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Link as LinkIcon, Code, Quote, Minus, Undo2, Redo2, Type, Palette, Table, ImageIcon, X, Copy, ChevronsUpDown, Save, Check } from 'lucide-react';

import { CKEditor } from 'ckeditor4-react';
import { http, API } from '../../api/client';
import { useSite } from '../../context/SiteContext';

const fmt = (n) => (n ? Number(n).toLocaleString('vi-VN') + ' đ' : 'LIÊN HỆ');

/** Auto-generate SEO-friendly slug from Vietnamese text */
function toSlug(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'd'))
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Format current date yyyy-mm-dd */
function todayStr() {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000;
  return (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
}

const EMPTY_PRODUCT = {
  name: '', slug: '', sku: '',
  price: '', salePrice: '', saleStartTime: '', saleEndTime: '', stock: 10,
  image: '', gallery: [],
  cpu: '', ram: '', ssd: '', screen: '', vga: '', battery: '', weight: '',
  description: '', content: '', promotion: '', specs: '',
  active: true, featured: false,
  categoryId: '', brandId: '', productGroupId: '', needIds: [],
  metaTitle: '', metaDescription: '', metaImage: ''
};





export default function ProductsManage() {
  const { showToast, confirm } = useToast();
  const { settings } = useSite();
  const [view, setView] = useState('list');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtered, setFiltered] = useState([]);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [editId, setEditId] = useState(null);
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createdAt, setCreatedAt] = useState(todayStr());
  const [dragActive, setDragActive] = useState(false);
  const [needDropdownOpen, setNeedDropdownOpen] = useState(false);
  const needDropdownRef = useRef(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingType, setUploadingType] = useState(null); // 'main' or 'gallery'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState([]);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const tempFilesRef = useRef({});

  // States for AI Background Removal
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [removingBgTarget, setRemovingBgTarget] = useState(null);

  const load = () => {
    http.get('/admin/products').then((r) => setProducts(r.data)).catch(() => {});
  };

  const handleQuickUpdate = async (id, field, value) => {
    try {
      await http.patch(`/admin/products/${id}/quick-update`, { [field]: value });
      setProducts((current) => current.map(p => {
        if (p.id !== id) return p;
        const np = { ...p };
        if (field === 'featured') np.featured = value;
        if (field === 'active') np.active = value;
        if (field === 'outOfStock') np.stock = value ? 0 : 10;
        if (field === 'createdAt') np.createdAt = value + 'T00:00:00';
        return np;
      }));
      // Hiển thị thông báo khi cập nhật xong
      let statusMsg = 'Cập nhật thành công!';
      if (field === 'featured') statusMsg = value ? 'Đã bật Nổi bật' : 'Đã tắt Nổi bật';
      else if (field === 'active') statusMsg = value ? 'Đã bật Hiển thị' : 'Đã Ẩn sản phẩm';
      else if (field === 'outOfStock') statusMsg = value ? 'Đã đánh dấu Hết hàng' : 'Đã đánh dấu Còn hàng';
      else if (field === 'createdAt') statusMsg = 'Đã cập nhật Ngày tạo';
      
      showToast(statusMsg);
    } catch (err) {
      showToast('Không thể cập nhật nhanh: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    load();
    // Lấy cây danh mục (root + children) cho product form
    http.get('/admin/categories/tree').then((r) => setCategories(r.data)).catch(() => {});
    http.get('/admin/brands').then((r) => setBrands(r.data)).catch(() => {});
    http.get('/admin/product-groups').then((r) => setProductGroups(r.data)).catch(() => {});
    http.get('/admin/needs').then((r) => setNeeds(r.data)).catch(() => {});

    const handleClickOutside = (event) => {
      if (needDropdownRef.current && !needDropdownRef.current.contains(event.target)) {
        setNeedDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory, filterStatus, pageSize]);

  useEffect(() => {
    let res = products;
    if (filterCategory) {
      res = res.filter(p => p.category?.id?.toString() === filterCategory.toString());
    }
    if (filterStatus) {
      if (filterStatus === 'active') res = res.filter(p => p.active !== false);
      if (filterStatus === 'hidden') res = res.filter(p => p.active === false);
      if (filterStatus === 'featured') res = res.filter(p => p.featured === true);
      if (filterStatus === 'outOfStock') res = res.filter(p => p.stock === 0);
    }
    if (search) {
      const q = search.toLowerCase();
      res = res.filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }
    
    const total = Math.ceil(res.length / pageSize);
    setTotalPages(total > 0 ? total : 1);
    
    let validPage = currentPage;
    if (validPage > total) validPage = total > 0 ? total : 1;
    
    const start = (validPage - 1) * pageSize;
    setFiltered(res.slice(start, start + pageSize));
  }, [products, search, filterCategory, filterStatus, pageSize, currentPage]);

  const parseSpecsToHTML = (product) => {
    if (product.specs) {
      try {
        const parsed = JSON.parse(product.specs);
        if (Array.isArray(parsed)) {
          return `<ul>${parsed.map(s => `<li><strong>${s.key}:</strong> ${s.value}</li>`).join('')}</ul>`;
        }
      } catch {
        return product.specs;
      }
    }
    const items = [];
    if (product.cpu) items.push(`<li><strong>CPU:</strong> ${product.cpu}</li>`);
    if (product.ram) items.push(`<li><strong>RAM:</strong> ${product.ram}</li>`);
    if (product.ssd) items.push(`<li><strong>Ổ cứng:</strong> ${product.ssd}</li>`);
    if (product.screen) items.push(`<li><strong>Màn hình:</strong> ${product.screen}</li>`);
    if (product.vga) items.push(`<li><strong>VGA:</strong> ${product.vga}</li>`);
    if (product.battery) items.push(`<li><strong>Pin:</strong> ${product.battery}</li>`);
    if (product.weight) items.push(`<li><strong>Trọng lượng:</strong> ${product.weight}</li>`);
    if (items.length > 0) return `<ul>${items.join('')}</ul>`;
    return '';
  };

  /* ---- Form Handlers ---- */
  const openAdd = () => {
    setForm(EMPTY_PRODUCT);
    setEditId(null);
    setSlugManual(false);
    setCreatedAt(todayStr());
    setUploadedImages([]);
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
    setSelectedGalleryFiles([]);
    setView('form');
  };

  const openEdit = (item) => {
    setForm({
      ...item,
      saleStartTime: item.saleStartTime ? item.saleStartTime.substring(0, 16) : '',
      saleEndTime: item.saleEndTime ? item.saleEndTime.substring(0, 16) : '',
      categoryId: item.category?.id || '',
      brandId: item.brand?.id || '',
      productGroupId: item.productGroup?.id || '',
      needIds: item.needs ? item.needs.map(n => n.id) : (item.need ? [item.need.id] : []),
      gallery: item.gallery ? JSON.parse(item.gallery) : []
    });
    setCreatedAt(item.createdAt ? item.createdAt.substring(0, 10) : todayStr());
    setEditId(item.id);
    setSlugManual(true);
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
    setSelectedGalleryFiles([]);
    setView('form');
  };

  const handleNameChange = (value) => {
    setForm({ ...form, name: value, slug: toSlug(value) });
  };

  const handleLinkSeoChange = (value) => {
    setForm({ ...form, linkSeo: toSlug(value) });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e, addAnother = false) => {
    e.preventDefault();
    setSaving(true);
    try {
      const finalSlug = form.linkSeo ? form.linkSeo : form.slug;

      let mainImageUrl = form.image;
      if (selectedImageFile) {
        setUploadingType('main');
        const formData = new FormData();
        formData.append('file', selectedImageFile);
        const response = await http.post('/admin/uploads', formData, { 
          params: { folder: 'products' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        mainImageUrl = response.data.url;
        setUploadingType(null);
        setUploadProgress(0);
      }

      let galleryUrls = [...(form.gallery || [])];
      if (selectedGalleryFiles.length > 0) {
        setUploadingType('gallery');
        let completedFiles = 0;
        const totalFiles = selectedGalleryFiles.length;
        const uploadPromises = selectedGalleryFiles.map(async (f) => {
          const formData = new FormData();
          formData.append('file', f.file);
          const response = await http.post('/admin/uploads', formData, { params: { folder: 'products' } });
          completedFiles++;
          setUploadProgress(Math.round((completedFiles / totalFiles) * 100));
          return response.data.url;
        });
        const results = await Promise.all(uploadPromises);
        galleryUrls = [...galleryUrls, ...results];
        setUploadingType(null);
        setUploadProgress(0);
      }
      
      const items = [];
      if (form.cpu) items.push(`<li><strong>CPU:</strong> ${form.cpu}</li>`);
      if (form.ram) items.push(`<li><strong>RAM:</strong> ${form.ram}</li>`);
      if (form.ssd) items.push(`<li><strong>Ổ cứng:</strong> ${form.ssd}</li>`);
      if (form.screen) items.push(`<li><strong>Màn hình:</strong> ${form.screen}</li>`);
      if (form.vga) items.push(`<li><strong>VGA:</strong> ${form.vga}</li>`);
      if (form.battery) items.push(`<li><strong>Pin:</strong> ${form.battery}</li>`);
      if (form.weight) items.push(`<li><strong>Trọng lượng:</strong> ${form.weight}</li>`);
      const generatedSpecs = items.length > 0 ? `<ul>${items.join('')}</ul>` : '';

      const data = {
        name: form.name,
        slug: finalSlug,
        sku: form.sku,
        brandId: form.brandId ? Number(form.brandId) : null,
        productGroupId: form.productGroupId ? Number(form.productGroupId) : null,
        needIds: form.needIds || [],
        price: Number(form.price) || 0,
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        saleStartTime: form.saleStartTime ? form.saleStartTime + ':00' : null,
        saleEndTime: form.saleEndTime ? form.saleEndTime + ':00' : null,
        stock: form.stock ? Number(form.stock) : 0,
        image: mainImageUrl,
        gallery: JSON.stringify(galleryUrls),
        cpu: form.cpu,
        ram: form.ram,
        ssd: form.ssd,
        screen: form.screen,
        vga: form.vga,
        battery: form.battery,
        weight: form.weight,
        description: form.description,
        content: form.content,
        promotion: form.promotion,
        specs: generatedSpecs,
        active: form.active,
        featured: form.featured,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        metaImage: form.metaImage,
      };
      let savedId = editId;
      if (editId) {
        await http.put(`/admin/products/${editId}`, data);
      } else {
        const createRes = await http.post('/admin/products', data);
        savedId = createRes.data?.id;
      }
      
      // Update createdAt if changed
      if (savedId && createdAt) {
        const oldCreatedAt = editId ? products.find(p => p.id === editId)?.createdAt?.substring(0, 10) : todayStr();
        if (createdAt !== oldCreatedAt || (!editId && createdAt !== todayStr())) {
          try {
            await http.patch(`/admin/products/${savedId}/quick-update`, { createdAt });
          } catch (e) {
            console.error('Failed to update date:', e);
          }
        }
      }
      
      load();
      if (addAnother) {
        setForm(EMPTY_PRODUCT);
        setEditId(null);
        setSlugManual(false);
        setCreatedAt(todayStr());
        setSelectedImageFile(null);
        setSelectedImagePreview(null);
        setSelectedGalleryFiles([]);
      } else {
        setView('list');
      }
    } catch (err) {
      console.error("Lỗi khi lưu sản phẩm:", err, err.response?.data);
      let errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Không thể lưu';
      if (typeof err.response?.data === 'string') errMsg = `Lỗi máy chủ (${err.response.status})`;
      showToast('Lỗi: ' + errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!await confirm(`Xác nhận xóa sản phẩm "${name}"?`)) return;
    try {
      await http.delete(`/admin/products/${id}`);
      load();
    } catch {
      showToast('Không thể xóa sản phẩm');
    }
  };

  const handleDuplicate = async (p) => {
    if (!await confirm(`Xác nhận nhân bản sản phẩm "${p.name}"?`)) return;
    try {
      const newName = p.name + ' (Copy)';
      const finalSlug = toSlug(newName) + '-' + Date.now();
      
      const data = {
        name: newName,
        slug: finalSlug,
        sku: p.sku ? p.sku + '-COPY' : '',
        brandId: p.brand?.id || null,
        productGroupId: p.productGroup?.id || null,
        needIds: p.needs ? p.needs.map(n => n.id) : (p.need ? [p.need.id] : []),
        price: Number(p.price) || 0,
        salePrice: p.salePrice ? Number(p.salePrice) : null,
        saleStartTime: p.saleStartTime || null,
        saleEndTime: p.saleEndTime || null,
        stock: p.stock ? Number(p.stock) : 0,
        image: p.image,
        gallery: p.gallery || '[]',
        cpu: p.cpu,
        ram: p.ram,
        ssd: p.ssd,
        screen: p.screen,
        vga: p.vga,
        battery: p.battery,
        weight: p.weight,
        description: p.description,
        content: p.content,
        promotion: p.promotion,
        specs: p.specs,
        active: p.active,
        featured: false,
        categoryId: p.category?.id || null,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        metaImage: p.metaImage,
      };
      
      await http.post('/admin/products', data);
      showToast('Nhân bản thành công!');
      load();
    } catch (err) {
      showToast('Không thể nhân bản: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReset = () => {
    if (editId) {
      const orig = products.find((p) => p.id === editId);
      if (orig) openEdit(orig);
    } else {
      setForm(EMPTY_PRODUCT);
      setSlugManual(false);
      setSelectedImageFile(null);
      setSelectedImagePreview(null);
      setSelectedGalleryFiles([]);
    }
  };

  /* ---- Drag & Drop Image ---- */
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = async (files) => {
    const file = Array.from(files).find((item) => item.type.startsWith('image/'));
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ảnh không được vượt quá 5MB');
      return;
    }
    
    let finalFile = file;
    const shouldRemoveBg = settings?.autoRemoveBg === 'main' || settings?.autoRemoveBg === 'both';
    
    if (shouldRemoveBg) {
      setIsRemovingBg(true);
      setRemovingBgTarget('main');
      showToast('AI đang tự động xóa nền...');
      try {
        const imglyRemoveBackground = (await import('@imgly/background-removal')).default;
        const blob = await imglyRemoveBackground(file, {
          publicPath: "https://unpkg.com/@imgly/background-removal@1.7.0/dist/"
        });
        finalFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "_rmbg.png", { type: 'image/png' });
        showToast('✨ Xóa nền tự động thành công!');
      } catch (err) {
        console.error('Background removal error:', err);
        showToast('Lỗi khi xóa nền AI: ' + err.message);
      } finally {
        setIsRemovingBg(false);
        setRemovingBgTarget(null);
      }
    }
    
    setSelectedImageFile(finalFile);
    setSelectedImagePreview(URL.createObjectURL(finalFile));
  };

  const handleGalleryFiles = async (e) => {
    const files = Array.from(e.target.files).filter((item) => item.type.startsWith('image/'));
    if (!files.length) return;
    
    let processedFiles = [];
    const shouldRemoveBg = settings?.autoRemoveBg === 'gallery' || settings?.autoRemoveBg === 'both';
    
    if (shouldRemoveBg) {
      setIsRemovingBg(true);
      setRemovingBgTarget('gallery_all');
      showToast('AI đang tự động xóa nền cho ảnh phụ...');
    }

    try {
      let imglyRemoveBackground;
      if (shouldRemoveBg) {
        imglyRemoveBackground = (await import('@imgly/background-removal')).default;
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) continue;
        
        let finalFile = file;
        if (shouldRemoveBg) {
          try {
            const blob = await imglyRemoveBackground(file, {
              publicPath: "https://unpkg.com/@imgly/background-removal@1.7.0/dist/"
            });
            finalFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "_rmbg.png", { type: 'image/png' });
          } catch(err) {
            console.error(err);
          }
        }
        
        processedFiles.push({
          file: finalFile,
          preview: URL.createObjectURL(finalFile)
        });
      }
      
      if (processedFiles.length < files.length && !shouldRemoveBg) {
        showToast('Một số ảnh lớn hơn 5MB đã bị bỏ qua');
      }
      if (shouldRemoveBg) {
        showToast('✨ Đã tự động xóa nền ảnh phụ!');
      }

      setSelectedGalleryFiles(prev => [...prev, ...processedFiles]);
    } finally {
      if (shouldRemoveBg) {
        setIsRemovingBg(false);
        setRemovingBgTarget(null);
      }
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const removeGalleryImage = (indexToRemove) => {
    setForm(current => ({
       ...current,
       gallery: (current.gallery || []).filter((_, i) => i !== indexToRemove)
    }));
  };

  const removeSelectedGalleryFile = (indexToRemove) => {
    setSelectedGalleryFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[indexToRemove].preview);
      newFiles.splice(indexToRemove, 1);
      return newFiles;
    });
  };

  /* ---- AI Background Removal ---- */
  const handleRemoveBg = async (e, type, index = null) => {
    e.preventDefault();
    e.stopPropagation();
    
    let fileToProcess = null;
    if (type === 'main') {
      fileToProcess = selectedImageFile;
    } else {
      fileToProcess = selectedGalleryFiles[index]?.file;
    }

    if (!fileToProcess) return;

    setIsRemovingBg(true);
    setRemovingBgTarget(type === 'main' ? 'main' : index);

    try {
      showToast('AI đang phân tích và tách nền... (lần đầu có thể mất vài giây tải mô hình)');
      
      const imglyRemoveBackground = (await import('@imgly/background-removal')).default;

      // Force to use CDN to avoid bundler issues
      const blob = await imglyRemoveBackground(fileToProcess, {
        publicPath: "https://unpkg.com/@imgly/background-removal@1.7.0/dist/"
      });
      
      const newFile = new File([blob], fileToProcess.name.replace(/\.[^/.]+$/, "") + "_rmbg.png", { type: 'image/png' });

      if (type === 'main') {
        setSelectedImageFile(newFile);
        setSelectedImagePreview(URL.createObjectURL(newFile));
      } else {
        setSelectedGalleryFiles(prev => {
          const newArr = [...prev];
          URL.revokeObjectURL(newArr[index].preview);
          newArr[index] = { file: newFile, preview: URL.createObjectURL(newFile) };
          return newArr;
        });
      }
      
      showToast('✨ Xóa nền thành công!');
    } catch (err) {
      console.error('Background removal error:', err);
      showToast('Lỗi khi xóa nền AI: ' + err.message);
    } finally {
      setIsRemovingBg(false);
      setRemovingBgTarget(null);
    }
  };

  /* =============== FORM VIEW =============== */
  if (view === 'form') {

    return (
      <div className="admin-product-page fade-in">
        {/* Header */}
        <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setView('list')} type="button">
              <ArrowLeft size={16} />
            </button>
            <h1>{editId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
          </div>
          <div className="admin-header-actions">
            <div className="admin-header-user">
              <Globe size={16} />
              <span>Quản trị viên</span>
              <span className="admin-header-divider">|</span>
              <span>Xin chào admin</span>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => handleSave(e, false)}>
          <div className="admin-form-grid">
            {/* ---- LEFT COLUMN ---- */}
            <div className="admin-form-left">

              {/* Section: Thông tin sản phẩm */}
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">
                  <Package size={18} /> Thông tin sản phẩm
                </h3>
                <div className="form-row-2">
                  {/* Cột 1: Thông tin cơ bản */}
                  <div className="form-col" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Tên sản phẩm *</label>
                      <input className="form-input" name="name" value={form.name} onChange={(e) => handleNameChange(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Thương hiệu sản phẩm</label>
                      <select className="form-input" name="brandId" value={form.brandId || ''} onChange={handleChange}>
                        <option value="">-- Chọn thương hiệu sản phẩm --</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phân nhóm sản phẩm</label>
                      <select className="form-input" name="productGroupId" value={form.productGroupId || ''} onChange={handleChange}>
                        <option value="">-- Chọn nhóm sản phẩm --</option>
                        {productGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group" ref={needDropdownRef}>
                      <label className="form-label">Nhu cầu</label>
                      <div 
                        className="form-input" 
                        style={{ minHeight: '38px', height: 'auto', display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '4px 8px', cursor: 'pointer', position: 'relative' }}
                        onClick={() => setNeedDropdownOpen(!needDropdownOpen)}
                      >
                        {(form.needIds || []).length > 0 ? (
                          (form.needIds || []).map(id => {
                            const n = needs.find(x => x.id === id);
                            if (!n) return null;
                            return (
                              <span key={id} style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', padding: '2px 6px', fontSize: '14px', color: '#333' }}>
                                <X size={14} style={{ marginRight: '6px', cursor: 'pointer', color: '#666' }} onClick={(e) => {
                                  e.stopPropagation();
                                  setForm({ ...form, needIds: (form.needIds || []).filter(x => x !== id) });
                                }} />
                                {n.name}
                              </span>
                            );
                          })
                        ) : (
                          <span style={{ color: '#aaa', alignSelf: 'center', margin: '4px 0', fontSize: '14px' }}>-- Chọn nhu cầu sử dụng sản phẩm --</span>
                        )}
                        
                        {needDropdownOpen && (
                          <div style={{ position: 'absolute', top: '100%', left: '-1px', right: '-1px', background: '#fff', border: '1px solid #ddd', borderRadius: '0 0 4px 4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            {needs.map(n => {
                              const isSelected = (form.needIds || []).includes(n.id);
                              return (
                                <div 
                                  key={n.id} 
                                  style={{ padding: '8px 12px', background: isSelected ? '#1b3b5a' : 'transparent', color: isSelected ? '#fff' : '#333', cursor: 'pointer', fontSize: '14px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newIds = isSelected 
                                      ? (form.needIds || []).filter(id => id !== n.id)
                                      : [...(form.needIds || []), n.id];
                                    setForm({ ...form, needIds: newIds });
                                  }}
                                  onMouseEnter={(e) => { if (!isSelected) e.target.style.background = '#f8f9fa'; }}
                                  onMouseLeave={(e) => { if (!isSelected) e.target.style.background = 'transparent'; }}
                                >
                                  {n.name}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Giá gốc</label>
                      <input className="form-input" name="price" type="number" value={form.price} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Giá giảm (Khuyến mãi)</label>
                      <input className="form-input" name="salePrice" type="number" value={form.salePrice || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Thời gian bắt đầu KM</label>
                      <input className="form-input" name="saleStartTime" type="datetime-local" value={form.saleStartTime || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Thời gian kết thúc KM</label>
                      <input className="form-input" name="saleEndTime" type="datetime-local" value={form.saleEndTime || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số lượng tồn kho</label>
                      <input className="form-input" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required />
                    </div>
                  </div>
                  
                  {/* Cột 2: SEO & Hệ thống */}
                  <div className="form-col" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Ngày tạo</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={createdAt} 
                        onChange={(e) => setCreatedAt(e.target.value)} 
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Link SEO (Tùy chỉnh)</label>
                      <input 
                        className="form-input" 
                        value={form.linkSeo || ''} 
                        onChange={(e) => handleLinkSeoChange(e.target.value)} 
                        placeholder={form.slug || 'Nhập link SEO tùy chỉnh...'} 
                      />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        Để trống sẽ lấy theo Slug mặc định
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Slug (Mặc định)</span>
                        <span style={{ fontSize: '11px', color: 'var(--primary)' }}>⚡ Tự động chuẩn SEO Google</span>
                      </label>
                      <input 
                        className="form-input" 
                        value={form.slug} 
                        readOnly 
                        placeholder="tu-dong-tao-tu-ten-san-pham"
                        style={{ background: '#f1f3f5', cursor: 'not-allowed', color: '#666' }}
                        title="Hệ thống tự động tạo và cập nhật chuẩn SEO theo Tên sản phẩm, không thể sửa thủ công"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Meta title</label>
                      <input className="form-input" name="metaTitle" value={form.metaTitle} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Meta description</label>
                      <textarea className="form-input" name="metaDescription" rows="2" value={form.metaDescription} onChange={handleChange} style={{ resize: 'vertical' }}></textarea>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Đường dẫn Meta image</label>
                      <input className="form-input" name="metaImage" value={form.metaImage} onChange={handleChange} />
                    </div>
                  </div>
                </div>


              </div>

              {/* Section: Mô tả */}
              <div className="admin-form-section" style={{ zIndex: 3 }}>
                <h3 className="admin-form-section-title">📝 Mô tả</h3>
                <div className="ckeditor-wrap">
                  <CKEditor
                    key={`description-${editId || 'new'}`}
                    editorUrl="https://cdn.ckeditor.com/4.22.1/full-all/ckeditor.js"
                    initData={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.editor.getData() }))}
                    config={{
                      filebrowserBrowseUrl: '/admin/file-browser',
                      filebrowserUploadUrl: `${API}/admin/uploads/ckeditor?folder=products&token=${localStorage.getItem('admin_token')}`,
                      filebrowserUploadMethod: 'form',
                      versionCheck: false,
                      height: 150,
                      toolbar: [
                        { name: 'document', items: ['Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates'] },
                        { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
                        { name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'] },
                        { name: 'forms', items: ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'] },
                        '/',
                        { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'] },
                        { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
                        { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
                        { name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'] },
                        '/',
                        { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
                        { name: 'colors', items: ['TextColor', 'BGColor'] },
                        { name: 'tools', items: ['Maximize', 'ShowBlocks'] }
                      ]
                    }}
                  />
                </div>
              </div>

              {/* Section: Nội dung chi tiết */}
              <div className="admin-form-section" style={{ zIndex: 2 }}>
                <h3 className="admin-form-section-title">📄 Nội dung</h3>
                <div className="ckeditor-wrap">
                  <CKEditor
                    key={`content-${editId || 'new'}`}
                    editorUrl="https://cdn.ckeditor.com/4.22.1/full-all/ckeditor.js"
                    initData={form.content}
                    onChange={(e) => setForm(prev => ({ ...prev, content: e.editor.getData() }))}
                    config={{
                      filebrowserBrowseUrl: '/admin/file-browser',
                      filebrowserUploadUrl: `${API}/admin/uploads/ckeditor?folder=products&token=${localStorage.getItem('admin_token')}`,
                      filebrowserUploadMethod: 'form',
                      allowedContent: true,
                      versionCheck: false,
                      height: 250,
                      toolbar: [
                        { name: 'document', items: ['Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates'] },
                        { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
                        { name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'] },
                        { name: 'forms', items: ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'] },
                        '/',
                        { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'] },
                        { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
                        { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
                        { name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'] },
                        '/',
                        { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
                        { name: 'colors', items: ['TextColor', 'BGColor'] },
                        { name: 'tools', items: ['Maximize', 'ShowBlocks'] }
                      ]
                    }}
                  />
                </div>
              </div>

              {/* Section: Khuyến mãi */}
              <div className="admin-form-section" style={{ zIndex: 1 }}>
                <h3 className="admin-form-section-title">🎁 Khuyến mãi</h3>
                <div className="ckeditor-wrap">
                  <CKEditor
                    key={`promotion-${editId || 'new'}`}
                    editorUrl="https://cdn.ckeditor.com/4.22.1/full-all/ckeditor.js"
                    initData={form.promotion}
                    onChange={(e) => setForm(prev => ({ ...prev, promotion: e.editor.getData() }))}
                    config={{
                      filebrowserBrowseUrl: '/admin/file-browser',
                      filebrowserUploadUrl: `${API}/admin/uploads/ckeditor?folder=products&token=${localStorage.getItem('admin_token')}`,
                      filebrowserUploadMethod: 'form',
                      allowedContent: true,
                      versionCheck: false,
                      height: 120,
                      toolbar: [
                        { name: 'document', items: ['Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates'] },
                        { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
                        { name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'] },
                        { name: 'forms', items: ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'] },
                        '/',
                        { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'] },
                        { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
                        { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
                        { name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'] },
                        '/',
                        { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
                        { name: 'colors', items: ['TextColor', 'BGColor'] },
                        { name: 'tools', items: ['Maximize', 'ShowBlocks'] }
                      ]
                    }}
                  />
                </div>
              </div>

              {/* Section: Trạng thái hiển thị */}
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">Trạng thái hiển thị</h3>
                <div className="form-toggles">
                  <label className="toggle-label">
                    <div className="toggle-switch">
                      <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
                      <span className="toggle-slider"></span>
                    </div>
                    <span>⭐ Sản phẩm nổi bật</span>
                  </label>
                  <label className="toggle-label">
                    <div className="toggle-switch">
                      <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
                      <span className="toggle-slider"></span>
                    </div>
                    <span>{form.active ? '🟢 Đang bán' : '🔴 Ẩn sản phẩm'}</span>
                  </label>
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="admin-form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : '💾 Lưu'}
                </button>
                <button type="button" className="btn btn-success" onClick={(e) => handleSave(e, false)} disabled={saving}>
                  ✅ Lưu và thoát
                </button>
              </div>
            </div>

            {/* ---- RIGHT COLUMN ---- */}
            <div className="admin-form-right">

              {/* Categories - nested tree */}
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">Danh mục sản phẩm</h3>
                <div className="category-checkbox-list">
                  {categories.length > 0 ? (() => {
                    const renderTree = (nodes, level = 0) => {
                      let rendered = [];
                      nodes.forEach(node => {
                        const isSelected = form.categoryId == node.id;
                        rendered.push(
                          <label key={node.id} className={`category-checkbox-item ${isSelected ? 'active' : ''} ${level === 0 ? 'level-0' : 'level-n'}`}
                            style={{ 
                              paddingLeft: level > 0 ? `${level * 20 + 12}px` : '12px'
                            }}>
                            <input type="radio" name="categoryId" checked={isSelected} onChange={() => setForm({ ...form, categoryId: node.id })} />
                            <span>{level === 0 ? '📁' : '└'} {node.name}</span>
                          </label>
                        );
                        if (node.children && node.children.length > 0) {
                          rendered.push(...renderTree(node.children, level + 1));
                        }
                      });
                      return rendered;
                    };
                    return renderTree(categories);
                  })() : (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '8px 0' }}>
                      Chưa có danh mục. Vui lòng tạo danh mục trước.
                    </p>
                  )}
                </div>
              </div>


              {/* Hình đại diện */}
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">Hình đại diện</h3>
                <div className={`image-upload-area ${dragActive ? 'drag-active' : ''}`}
                     style={{ border: '2px dashed #ddd', padding: (form.image || selectedImagePreview) ? '5px' : '20px', textAlign: 'center', cursor: (form.image || selectedImagePreview) || uploadingType === 'main' ? 'default' : 'pointer', minHeight: '150px', background: '#f9fafb', borderRadius: '8px' }}
                     onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => !(form.image || selectedImagePreview) && uploadingType !== 'main' && fileInputRef.current?.click()}
                >
                  {uploadingType === 'main' ? (
                    <div style={{ padding: '40px 0' }}>
                      <p style={{ margin: '0 0 10px', color: 'var(--primary)', fontWeight: 'bold' }}>Đang tải lên... {uploadProgress}%</p>
                      <div style={{ width: '80%', height: '6px', background: '#e0e0e0', margin: '0 auto', borderRadius: '3px', overflow: 'hidden' }}>
                         <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }}></div>
                      </div>
                    </div>
                  ) : !(form.image || selectedImagePreview) ? (
                    <div style={{ pointerEvents: 'none', marginTop: '20px' }}>
                      <Upload size={40} style={{ color: '#ccc', marginBottom: '10px' }} />
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Click hoặc kéo thả ảnh vào đây</p>
                    </div>
                  ) : (
                    <div>
                      <img src={selectedImagePreview || form.image} alt="Preview" style={{ maxWidth: '100%', borderRadius: '4px', display: 'block' }} />
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
                </div>
                
                {(form.image || selectedImagePreview) && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    {selectedImagePreview && (
                      <button 
                        type="button" 
                        className="btn btn-sm" 
                        style={{ flex: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', fontWeight: 'bold' }} 
                        onClick={(e) => handleRemoveBg(e, 'main')}
                        disabled={isRemovingBg}
                      >
                        {isRemovingBg && removingBgTarget === 'main' ? '⏳ Đang tách...' : '✨ Xóa nền AI'}
                      </button>
                    )}
                    <button type="button" className="btn btn-sm" style={{ flex: 1, background: '#f1f3f5', color: '#000', border: '1px solid #ddd', fontWeight: 'bold' }} onClick={() => { setForm(prev => ({ ...prev, image: '' })); setSelectedImageFile(null); setSelectedImagePreview(null); }}>Xóa ảnh</button>
                  </div>
                )}
              </div>

              {/* Hình ảnh phụ (Gallery) */}
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">Hình ảnh phụ (Gallery)</h3>
                <div className="image-upload-area"
                     style={{ border: '2px dashed #ddd', padding: '20px', textAlign: 'center', cursor: uploadingType === 'gallery' ? 'default' : 'pointer', background: '#f9fafb', borderRadius: '8px' }}
                     onClick={() => uploadingType !== 'gallery' && galleryInputRef.current?.click()}
                >
                  {uploadingType === 'gallery' ? (
                    <div style={{ padding: '10px 0' }}>
                      <p style={{ margin: '0 0 10px', color: 'var(--primary)', fontWeight: 'bold' }}>Đang tải lên... {uploadProgress}%</p>
                      <div style={{ width: '80%', height: '6px', background: '#e0e0e0', margin: '0 auto', borderRadius: '3px', overflow: 'hidden' }}>
                         <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }}></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} style={{ color: '#ccc', marginBottom: '5px' }} />
                      <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>Click để tải nhiều ảnh</p>
                    </>
                  )}
                  <input ref={galleryInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGalleryFiles} />
                </div>
                {((form.gallery && form.gallery.length > 0) || (selectedGalleryFiles && selectedGalleryFiles.length > 0)) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                    {form.gallery && form.gallery.map((url, i) => (
                      <div key={i} style={{ position: 'relative', border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
                        <img src={url} alt={`Gallery ${i}`} style={{ width: '100%', height: '80px', objectFit: 'contain', background: '#fff', display: 'block' }} />
                        <button type="button" onClick={() => removeGalleryImage(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {selectedGalleryFiles && selectedGalleryFiles.map((item, i) => (
                      <div key={`new-${i}`} style={{ position: 'relative', border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
                        <img src={item.preview} alt={`New Gallery ${i}`} style={{ width: '100%', height: '80px', objectFit: 'contain', background: '#fff', display: 'block' }} />
                        <button type="button" onClick={() => removeSelectedGalleryFile(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                          <X size={12} />
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => handleRemoveBg(e, 'gallery', i)} 
                          disabled={isRemovingBg} 
                          style={{ margin: '4px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontSize: '11px', padding: '4px 2px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'calc(100% - 8px)', fontWeight: 'bold' }}
                        >
                          {isRemovingBg && removingBgTarget === i ? '⏳...' : '✨ Xóa nền'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Info */}
              <div className="admin-form-section">
                <h3 className="admin-form-section-title">📊 Trạng thái</h3>
                <div className="status-info-list">
                  <div className="status-info-row">
                    <span>Trạng thái</span>
                    <span className={`badge ${form.active ? 'badge-success' : 'badge-danger'}`}>
                      {form.active ? 'Đang bán' : 'Đã ẩn'}
                    </span>
                  </div>
                  <div className="status-info-row">
                    <span>Nổi bật</span>
                    <span className={`badge ${form.featured ? 'badge-warning' : 'badge-info'}`}>
                      {form.featured ? 'Có' : 'Không'}
                    </span>
                  </div>
                  {form.salePrice && form.price && Number(form.salePrice) < Number(form.price) && (
                    <div className="status-info-row">
                      <span>Giảm giá</span>
                      <span className="badge badge-danger">
                        -{Math.round(((form.price - form.salePrice) / form.price) * 100)}%
                      </span>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  /* =============== LIST VIEW =============== */
  return (
    <>
      <div className="admin-header">
        <h1><Package size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Quản lý sản phẩm</h1>
        <div className="admin-header-actions">
          <button className="btn btn-primary btn-sm" onClick={openAdd} id="add-product-btn">
            <Plus size={16} /> Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#666' }}>Danh mục sản phẩm</label>
            <select className="form-input" style={{ width: '220px', padding: '6px 12px' }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">Tất cả danh mục</option>
              {/* Nhóm theo danh mục cha */}
              {categories.filter(c => c.children && c.children.length > 0).map(parent => (
                <optgroup key={parent.id} label={`📁 ${parent.name}`}>
                  <option value={parent.id}>{parent.name} (tất cả)</option>
                  {parent.children.map(child => (
                    <option key={child.id} value={child.id}>└ {child.name}</option>
                  ))}
                </optgroup>
              ))}
              {/* Danh mục không có cha */}
              {categories.filter(c => !categories.some(p => p.children && p.children.some(ch => ch.id === c.id)) && !(c.children && c.children.length > 0)).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#666' }}>Trạng thái sản phẩm</label>
            <select className="form-input" style={{ width: '220px', padding: '6px 12px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang bán (Hiển thị)</option>
              <option value="hidden">Đã ẩn</option>
              <option value="featured">Nổi bật</option>
              <option value="outOfStock">Hết hàng</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#333' }}>Hiển thị:</label>
            <select className="form-input" style={{ width: '70px', padding: '6px' }} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#333' }}>Tìm kiếm:</label>
            <input
              className="form-input"
              style={{ width: '250px', padding: '6px 12px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table" style={{ verticalAlign: 'middle', border: '1px solid #eee' }}>
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center', borderRight: '1px solid #eee' }}>STT <ChevronsUpDown size={12} style={{ color: '#ccc', verticalAlign: 'middle' }} /></th>
              <th style={{ width: '70px', textAlign: 'center', borderRight: '1px solid #eee' }}>Ảnh</th>
              <th style={{ borderRight: '1px solid #eee' }}>Tên sản phẩm</th>
              <th style={{ width: '130px', textAlign: 'center', borderRight: '1px solid #eee' }}>Ngày tạo <ChevronsUpDown size={12} style={{ color: '#ccc', verticalAlign: 'middle' }} /></th>
              <th style={{ width: '90px', textAlign: 'center', borderRight: '1px solid #eee' }}>Nổi bật</th>
              <th style={{ width: '90px', textAlign: 'center', borderRight: '1px solid #eee' }}>Hiển thị</th>
              <th style={{ width: '90px', textAlign: 'center', borderRight: '1px solid #eee' }}>Hết hàng</th>
              <th style={{ width: '260px', textAlign: 'center' }}>Công cụ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map((p, index) => (
              <tr key={p.id}>
                <td style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>{index + 1}</td>
                <td style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>
                  <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', background: '#f8f9fa', display: 'inline-block' }} />
                </td>
                <td style={{ borderRight: '1px solid #eee' }}>
                  <div style={{ fontWeight: '400', fontSize: '14px', color: '#333' }}>{p.name}</div>
                </td>
                <td style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>
                  <input 
                    key={p.id + '-' + (p.createdAt ? p.createdAt.substring(0, 10) : '')}
                    type="date" 
                    className="form-input" 
                    style={{ padding: '0', fontSize: '13px', width: '105px', textAlign: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    defaultValue={p.createdAt ? p.createdAt.substring(0, 10) : ''}
                    onBlur={(e) => {
                      const val = e.target.value;
                      const oldVal = p.createdAt ? p.createdAt.substring(0, 10) : '';
                      if (val && val !== oldVal) {
                        handleQuickUpdate(p.id, 'createdAt', val);
                      }
                    }}
                  />
                </td>
                <td style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>
                  <label className="toggle-switch" style={{ display: 'inline-block', margin: '0 auto', transform: 'scale(0.8)' }}>
                    <input type="checkbox" checked={p.featured} onChange={(e) => handleQuickUpdate(p.id, 'featured', e.target.checked)} />
                    <span className="toggle-slider" style={{ background: p.featured ? '#0d6efd' : '#ccc' }}></span>
                  </label>
                </td>
                <td style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>
                  <label className="toggle-switch" style={{ display: 'inline-block', margin: '0 auto', transform: 'scale(0.8)' }}>
                    <input type="checkbox" checked={p.active !== false} onChange={(e) => handleQuickUpdate(p.id, 'active', e.target.checked)} />
                    <span className="toggle-slider" style={{ background: p.active !== false ? '#0d6efd' : '#ccc' }}></span>
                  </label>
                </td>
                <td style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>
                  <label className="toggle-switch" style={{ display: 'inline-block', margin: '0 auto', transform: 'scale(0.8)' }}>
                    <input type="checkbox" checked={p.stock === 0} onChange={(e) => handleQuickUpdate(p.id, 'outOfStock', e.target.checked)} />
                    <span className="toggle-slider" style={{ background: p.stock === 0 ? '#0d6efd' : '#ccc' }}></span>
                  </label>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div className="actions" style={{ justifyContent: 'center', gap: '5px' }}>
                    <button className="admin-btn-edit" style={{ background: '#198754', color: '#fff', borderRadius: '4px', padding: '4px 8px' }} onClick={() => handleDuplicate(p)} title="Copy">
                      <Copy size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Copy
                    </button>
                    <button className="admin-btn-edit" style={{ background: '#0d6efd', color: '#fff', borderRadius: '4px', padding: '4px 8px' }} onClick={() => openEdit(p)} title="Sửa">
                      <Edit2 size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Chỉnh sửa
                    </button>
                    <button className="admin-btn-delete" style={{ background: '#dc3545', color: '#fff', borderRadius: '4px', padding: '4px 8px' }} onClick={() => handleDelete(p.id, p.name)} title="Xóa">
                      <Trash2 size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Xóa
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  {search ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px', paddingBottom: '20px' }}>
          <button 
            className="btn btn-outline btn-sm" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={{ padding: '6px 12px', minWidth: '100px' }}
          >
            Trang trước
          </button>
          
          <div style={{ display: 'flex', gap: '5px' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setCurrentPage(page)}
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  padding: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: currentPage === page ? 'bold' : 'normal'
                }}
              >
                {page}
              </button>
            ))}
          </div>

          <button 
            className="btn btn-outline btn-sm" 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            style={{ padding: '6px 12px', minWidth: '100px' }}
          >
            Trang sau
          </button>
        </div>
      )}
    </>
  );
}
