import { useState, useEffect, useRef, type CSSProperties, type FormEvent } from 'react';
import { PC_CATEGORIES } from '../constants';
import { createComponent, updateComponent, uploadImage } from '../services/api';
import type { PcComponent } from '../types';

const CATEGORY_SPECS_TEMPLATE: Record<number, string[]> = {
    1: ['socket', 'cores', 'threads'],
    2: ['socket', 'ram_type', 'form_factor', 'chipset'],
    3: ['memory_gb', 'chipset', 'memory_type'],
    4: ['capacity_gb', 'type', 'frequency'],
    5: ['capacity_gb', 'form_factor', 'interface'],
    6: ['capacity_gb', 'form_factor', 'rpm'],
    7: ['type', 'tdp_w', 'height_mm'],
    8: ['type', 'radiator_size'],
    9: ['weight_g', 'thermal_conductivity'],
    10: ['wattage', 'certificate', 'modular'],
    11: ['form_factor', 'motherboard_support'],
    12: ['size_mm', 'rpm'],
    13: ['color', 'material'],
    14: ['color', 'rgb']
};

const SPEC_VALUE_SUGGESTIONS: Record<string, string[]> = {
    'socket': ['AM5', 'LGA1700', 'AM4', 'LGA1200'],
    'cores': ['4', '6', '8', '12', '14', '16', '24'],
    'threads': ['8', '12', '16', '20', '24', '32'],
    'ram_type': ['DDR4', 'DDR5'],
    'form_factor': ['ATX', 'Micro-ATX', 'Mini-ITX', 'M.2 2280', '3.5', '2.5', 'Midi-Tower'],
    'chipset': ['B650', 'B760', 'Z790', 'X670', 'RTX 4070', 'RX 7800 XT', 'RTX 4060', 'RTX 4090'],
    'memory_gb': ['8', '12', '16', '24'],
    'memory_type': ['GDDR6', 'GDDR6X'],
    'capacity_gb': ['16', '32', '64', '500', '1000', '2000', '4000'],
    'type': ['DDR4', 'DDR5', 'Air', 'AIO'],
    'frequency': ['3200', '3600', '5200', '6000', '6400'],
    'interface': ['PCI-E 3.0', 'PCI-E 4.0', 'PCI-E 5.0', 'SATA III'],
    'rpm': ['5400', '7200', '1800', '2000'],
    'tdp_w': ['65', '105', '120', '125', '250', '260'],
    'height_mm': ['150', '160', '163'],
    'radiator_size': ['120', '240', '280', '360'],
    'weight_g': ['1', '2', '4', '8'],
    'thermal_conductivity': ['8.5', '12.5'],
    'wattage': ['500', '650', '750', '850', '1000'],
    'certificate': ['80 PLUS Bronze', '80 PLUS Gold', '80 PLUS Platinum'],
    'modular': ['Full', 'Semi', 'Non-Modular'],
    'motherboard_support': ['ATX, Micro-ATX, Mini-ITX', 'Micro-ATX, Mini-ITX'],
    'size_mm': ['120', '140'],
    'color': ['Black', 'White', 'Black/White', 'Clear'],
    'material': ['Nylon', 'ModMesh'],
    'rgb': ['true', 'false']
};

interface AddComponentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    componentToEdit?: PcComponent | null;
}

export default function AddComponentModal({ isOpen, onClose, onSuccess, componentToEdit }: AddComponentModalProps) {
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState(PC_CATEGORIES[0].id);
    const [price, setPrice] = useState('');
    const [powerDraw, setPowerDraw] = useState('0');
    const [imageUrl, setImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [specFields, setSpecFields] = useState([{ key: '', value: '' }]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (componentToEdit) {
                setName(componentToEdit.name);
                setCategoryId(componentToEdit.category_id);
                setPrice(componentToEdit.price.toString());
                setPowerDraw((componentToEdit.power_draw_watts || 0).toString());
                setImageUrl(componentToEdit.image_url || '');
                setImagePreview(componentToEdit.image_url || null);
                
                const specsObj = typeof componentToEdit.specs === 'string' ? JSON.parse(componentToEdit.specs) : componentToEdit.specs;
                if (specsObj && Object.keys(specsObj).length > 0) {
                    setSpecFields(Object.entries(specsObj).map(([key, value]) => ({ key, value: String(value) })));
                } else {
                    const templateKeys = CATEGORY_SPECS_TEMPLATE[componentToEdit.category_id] || [];
                    setSpecFields(templateKeys.length > 0 ? templateKeys.map(k => ({ key: k, value: '' })) : [{ key: '', value: '' }]);
                }
            } else {
                setName('');
                setCategoryId(PC_CATEGORIES[0].id);
                setPrice('');
                setPowerDraw('0');
                setImageUrl('');
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                const templateKeys = CATEGORY_SPECS_TEMPLATE[PC_CATEGORIES[0].id] || [];
                setSpecFields(templateKeys.length > 0 ? templateKeys.map(k => ({ key: k, value: '' })) : [{ key: '', value: '' }]);
            }
            setError('');
        }
    }, [isOpen, componentToEdit]);

    const handleCategoryChange = (newCatId: number) => {
        setCategoryId(newCatId);
        const templateKeys = CATEGORY_SPECS_TEMPLATE[newCatId] || [];
        setSpecFields(templateKeys.length > 0 ? templateKeys.map(k => ({ key: k, value: '' })) : [{ key: '', value: '' }]);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImagePreview(URL.createObjectURL(file));
        setIsUploading(true);
        setError('');

        try {
            const result = await uploadImage(file);
            if (result.status === 'success' && result.url) {
                setImageUrl(`http://localhost:8000${result.url}`);
            } else {
                setError(result.message || 'Помилка завантаження зображення');
                setImagePreview(null);
            }
        } catch {
            setError('Не вдалося завантажити зображення на сервер');
            setImagePreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        const parsedSpecs: Record<string, any> = {};
        let hasSpecError = false;
        specFields.forEach(field => {
            const key = field.key.trim();
            const value = field.value.trim();
            if (key) {
                parsedSpecs[key] = isNaN(Number(value)) || value === '' ? value : Number(value);
            } else if (value) {
                hasSpecError = true;
            }
        });

        if (hasSpecError) {
            setError('Помилка: Усі значення повинні мати відповідну назву (ключ).');
            return;
        }

        setIsSubmitting(true);

        const payload = {
            name,
            category_id: categoryId,
            price: parseFloat(price),
            power_draw_watts: parseInt(powerDraw, 10),
            image_url: imageUrl,
            specs: JSON.stringify(parsedSpecs)
        };

        try {
            const res = componentToEdit
                ? await updateComponent(componentToEdit.id, payload)
                : await createComponent(payload);

            if (res.status === 'success') {
                onSuccess();
            } else {
                setError(res.message || 'Сталася помилка при збереженні.');
            }
        } catch (err) {
            setError('Помилка з\'єднання з сервером.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h2 style={titleStyle}>{componentToEdit ? 'Редагувати деталь' : 'Додати нову деталь'}</h2>
                    <button onClick={onClose} style={closeBtnStyle}>✕</button>
                </div>

                {error && <div style={errorStyle}>{error}</div>}

                <form onSubmit={handleSubmit} style={formStyle}>

                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Назва деталі</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={inputStyle}
                            placeholder="напр. AMD Ryzen 5 7600"
                        />
                    </div>

                    <div style={rowStyle}>
                        <div style={{...formGroupStyle, flex: 1}}>
                            <label style={labelStyle}>Категорія</label>
                            <select
                                value={categoryId}
                                onChange={(e) => handleCategoryChange(Number(e.target.value))}
                                style={inputStyle}
                            >
                                {PC_CATEGORIES.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{...formGroupStyle, flex: 1}}>
                            <label style={labelStyle}>Ціна (₴)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={rowStyle}>
                        <div style={{...formGroupStyle, flex: 1}}>
                            <label style={labelStyle}>Потужність (Вт)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={powerDraw}
                                onChange={(e) => setPowerDraw(e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        <div style={{...formGroupStyle, flex: 2}}>
                            <label style={labelStyle}>Зображення</label>
                            <div style={uploadBlockStyle}>
                                <div style={uploadBtnWrapStyle}>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        style={btnUploadStyle}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? '⏳ Завантаження...' : '📁'}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                    {imagePreview && (
                                        <img src={imagePreview} alt="preview" style={previewStyle} />
                                    )}
                                    <input
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => { setImageUrl(e.target.value); setImagePreview(null); }}
                                        style={{...inputStyle, marginBottom: 0}}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={formGroupStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }}>Специфікації</label>
                            <button
                                type="button"
                                onClick={() => setSpecFields([...specFields, { key: '', value: '' }])}
                                style={btnAddSpecStyle}
                            >
                                + Додати поле
                            </button>
                        </div>
                        
                        {specFields.map((field, index) => (
                            <div key={index} style={specRowStyle}>
                                <input
                                    type="text"
                                    placeholder="Назва (напр. socket)"
                                    value={field.key}
                                    onChange={(e) => {
                                        const newFields = [...specFields];
                                        newFields[index].key = e.target.value;
                                        setSpecFields(newFields);
                                    }}
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                                <input
                                    type="text"
                                    placeholder="Значення (напр. AM5)"
                                    value={field.value}
                                    list={`suggestions-${field.key}`}
                                    onChange={(e) => {
                                        const newFields = [...specFields];
                                        newFields[index].value = e.target.value;
                                        setSpecFields(newFields);
                                    }}
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newFields = specFields.filter((_, i) => i !== index);
                                        setSpecFields(newFields.length ? newFields : [{ key: '', value: '' }]);
                                    }}
                                    style={btnRemoveSpecStyle}
                                    title="Видалити"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    {Object.entries(SPEC_VALUE_SUGGESTIONS).map(([key, options]) => (
                        <datalist id={`suggestions-${key}`} key={key}>
                            {options.map(opt => <option value={opt} key={opt} />)}
                        </datalist>
                    ))}

                    <div style={footerStyle}>
                        <button type="button" onClick={onClose} style={btnCancelStyle}>Скасувати</button>
                        <button type="submit" disabled={isSubmitting} style={btnSubmitStyle}>
                            {isSubmitting ? 'Збереження...' : (componentToEdit ? 'Зберегти зміни' : 'Зберегти деталь')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const overlayStyle: CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' };
const modalStyle: CSSProperties = { width: '100%', maxWidth: '600px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' };
const headerStyle: CSSProperties = { padding: '25px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const titleStyle: CSSProperties = { margin: 0, fontSize: '20px', color: '#1e293b' };
const closeBtnStyle: CSSProperties = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' };
const formStyle: CSSProperties = { padding: '30px', overflowY: 'auto' };
const errorStyle: CSSProperties = { margin: '20px 30px 0', padding: '15px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '14px' };
const rowStyle: CSSProperties = { display: 'flex', gap: '20px' };
const formGroupStyle: CSSProperties = { marginBottom: '20px' };
const labelStyle: CSSProperties = { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#475569' };
const inputStyle: CSSProperties = { width: '100%', padding: '12px 15px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' };
const footerStyle: CSSProperties = { padding: '20px 30px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '15px', backgroundColor: '#f8fafc', borderRadius: '0 0 12px 12px' };
const btnCancelStyle: CSSProperties = { padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' };
const btnSubmitStyle: CSSProperties = { padding: '10px 25px', backgroundColor: '#a5c926', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', color: '#fff' };
const specRowStyle: CSSProperties = { display: 'flex', gap: '10px', marginBottom: '10px' };
const btnAddSpecStyle: CSSProperties = { background: 'none', border: 'none', color: '#a5c926', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', padding: 0 };
const btnRemoveSpecStyle: CSSProperties = { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', width: '42px', height: '42px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, transition: 'background-color 0.2s' };
const uploadBlockStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '10px' };
const uploadBtnWrapStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px' };
const btnUploadStyle: CSSProperties = { padding: '10px 16px', backgroundColor: '#f1f5f9', border: '1px dashed #94a3b8', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#475569', whiteSpace: 'nowrap', flexShrink: 0 };
const previewStyle: CSSProperties = { width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' };
