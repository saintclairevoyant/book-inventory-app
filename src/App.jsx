import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, setDoc, onSnapshot, query, where, deleteDoc, serverTimestamp } from 'firebase/firestore';

// --- Helper Components ---

// Icon component for better visual feedback
const Icon = ({ name, className = "w-6 h-6" }) => {
    const icons = {
        book: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
        plus: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
        search: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
        scan: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /></svg>,
        close: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
        camera: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>,
        info: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>,
        trash: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09.92-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
        sun: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>,
        moon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>,
    };
    return icons[name] || null;
};

// Tooltip component for help text
const Tooltip = ({ text, children }) => {
    return (
        <div className="relative flex items-center group">
            {children}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs p-2 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                {text}
            </div>
        </div>
    );
};

// --- Form Section Components ---

const FormSection = ({ title, children }) => (
    <div className="mt-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">{title}</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            {children}
        </div>
    </div>
);

const CheckboxField = ({ label, checked, onChange, fullWidth = false, name }) => (
    <div className={`relative flex items-start ${fullWidth ? 'sm:col-span-2' : ''}`}>
        <div className="flex h-6 items-center">
            <input 
                id={name}
                type="checkbox" 
                name={name} 
                checked={checked} 
                onChange={onChange} 
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" 
            />
        </div>
        <div className="ml-3 text-sm leading-6">
            <label 
                htmlFor={name}
                className="font-medium text-gray-900 dark:text-gray-200"
            >
                {label}
            </label>
        </div>
    </div>
);

// --- Main App Components ---

const BookForm = ({ book, onSave, onCancel }) => {
    const [formData, setFormData] = useState(book || {
        title: '', author: '', coverImageUrl: '', category: 'Available',
        publisher: '', publishingLocation: '', printer: '', printingLocation: '', copyrightDate: '',
        isFirstEdition: false, printRun: '', isLimitedEdition: false, isNumberedEdition: false, editionNumber: '', editionTotal: '',
        condition: 'Good', hasDustJacket: false, hasWritingOrHighlighting: false, isSigned: false, hasInscriptions: false, inscriptionText: '', isAssociationCopy: false,
        hasExtras: false, extras: [], notes: '', hasNotes: false,
        titlePageUrl: '', versoPageUrl: '', platesListPageUrl: '',
    });
    const [entryMode, setEntryMode] = useState('manual');
    const [isbn, setIsbn] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const conditionOptions = ['Fine', 'Very Fine', 'Near Fine', 'Good', 'Fair', 'Reading Copy Only'];
    const extraOptions = ['CD/DVD', 'Bookmark', 'Maps/Charts', 'Errata slip', "Publisher's band", 'Promotional materials'];
    const inputStyle = "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleExtrasChange = (extra) => {
        setFormData(prev => {
            const newExtras = prev.extras.includes(extra)
                ? prev.extras.filter(item => item !== extra)
                : [...prev.extras, extra];
            return { ...prev, extras: newExtras };
        });
    };

    const handleFetchIsbn = async () => {
        if (!isbn) return alert('Please enter an ISBN.');
        setIsLoading(true);
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn.trim()}`);
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                const bookData = data.items[0].volumeInfo;
                setFormData(prev => ({
                    ...prev,
                    title: bookData.title || '',
                    author: bookData.authors ? bookData.authors.join(', ') : '',
                    publisher: bookData.publisher || '',
                    copyrightDate: bookData.publishedDate || '',
                    coverImageUrl: bookData.imageLinks?.thumbnail || '',
                }));
            } else {
                alert('Book not found for this ISBN. Please enter details manually.');
            }
        } catch (error) {
            console.error("Error fetching ISBN data:", error);
            alert('Failed to fetch book data. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40">
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <form onSubmit={handleSubmit} className="relative w-full max-w-4xl transform rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all p-6 sm:p-8">
                        <div className="flex justify-between items-start">
                           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{book ? 'Edit Book' : 'Add New Book'}</h2>
                           <button type="button" onClick={onCancel} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                               <Icon name="close" className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                           </button>
                        </div>

                        {/* Entry Mode Toggle */}
                        <div className="my-4 border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button type="button" onClick={() => setEntryMode('manual')} className={`${entryMode === 'manual' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                    Manual Entry
                                </button>
                                <button type="button" onClick={() => setEntryMode('isbn')} className={`${entryMode === 'isbn' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                    Scan ISBN
                                </button>
                            </nav>
                        </div>

                        {entryMode === 'isbn' && (
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enter ISBN</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <div className="relative flex-grow focus-within:z-10">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Icon name="scan" className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)} id="isbn" className="block w-full rounded-none rounded-l-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="978-3-16-148410-0" />
                                    </div>
                                    <button type="button" onClick={handleFetchIsbn} disabled={isLoading} className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50">
                                        {isLoading ? 'Fetching...' : 'Fetch Info'}
                                    </button>
                                </div>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Enter the book's ISBN to autofill details. Some information may still need to be entered manually.</p>
                            </div>
                        )}

                        {/* Main Form Fields */}
                        <div className="max-h-[65vh] overflow-y-auto pr-2">
                            <FormSection title="Basic Information">
                                <div className="sm:col-span-2">
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} required className={inputStyle} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Author</label>
                                    <input type="text" name="author" value={formData.author} onChange={handleChange} className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                                        <option>Available</option>
                                        <option>Sold</option>
                                        <option>Personal</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image URL</label>
                                    <input type="text" name="coverImageUrl" value={formData.coverImageUrl} onChange={handleChange} className={inputStyle} placeholder="https://example.com/cover.jpg"/>
                                </div>
                            </FormSection>

                            <FormSection title="Publication Details">
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Publisher</label><input type="text" name="publisher" value={formData.publisher} onChange={handleChange} className={inputStyle} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Publishing Location</label><input type="text" name="publishingLocation" value={formData.publishingLocation} onChange={handleChange} className={inputStyle} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Printer</label><input type="text" name="printer" value={formData.printer} onChange={handleChange} className={inputStyle} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Printing Location</label><input type="text" name="printingLocation" value={formData.printingLocation} onChange={handleChange} className={inputStyle} /></div>
                                <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Copyright Date(s)</label><input type="text" name="copyrightDate" value={formData.copyrightDate} onChange={handleChange} className={inputStyle} /></div>
                            </FormSection>

                            <FormSection title="Edition & Print Information">
                                <CheckboxField name="isFirstEdition" label="First Edition" checked={formData.isFirstEdition} onChange={handleChange} />
                                <CheckboxField name="isLimitedEdition" label="Limited Edition" checked={formData.isLimitedEdition} onChange={handleChange} />
                                <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Print Run</label><input type="text" name="printRun" value={formData.printRun} onChange={handleChange} className={inputStyle} /></div>
                                <CheckboxField name="isNumberedEdition" label="Numbered Edition" checked={formData.isNumberedEdition} onChange={handleChange} fullWidth={true} />
                                {formData.isNumberedEdition && (
                                    <>
                                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Edition Number (X)</label><input type="number" name="editionNumber" value={formData.editionNumber} onChange={handleChange} className={inputStyle} /></div>
                                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total in Edition (Y)</label><input type="number" name="editionTotal" value={formData.editionTotal} onChange={handleChange} className={inputStyle} /></div>
                                    </>
                                )}
                            </FormSection>
                            
                            <FormSection title="Condition & Special Features">
                                 <div>
                                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label>
                                    <select name="condition" value={formData.condition} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                                        {conditionOptions.map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="pt-6 space-y-4 sm:col-span-2 grid grid-cols-2">
                                  <CheckboxField name="hasDustJacket" label="Has Dust Jacket" checked={formData.hasDustJacket} onChange={handleChange} />
                                  <CheckboxField name="hasWritingOrHighlighting" label="Writing/Highlighting" checked={formData.hasWritingOrHighlighting} onChange={handleChange} />
                                  <CheckboxField name="isSigned" label="Author Signed" checked={formData.isSigned} onChange={handleChange} />
                                  <div className="flex items-center space-x-2">
                                      <CheckboxField name="isAssociationCopy" label="Association Copy" checked={formData.isAssociationCopy} onChange={handleChange} />
                                      <Tooltip text="A book owned by someone famous, the author, or someone connected to the subject.">
                                          <Icon name="info" className="w-5 h-5 text-gray-400" />
                                      </Tooltip>
                                  </div>
                                </div>

                                <CheckboxField name="hasInscriptions" label="Contains Inscriptions" checked={formData.hasInscriptions} onChange={handleChange} fullWidth={true}/>
                                {formData.hasInscriptions && (
                                    <div className="sm:col-span-2">
                                        <label htmlFor="inscriptionText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transcription of Inscription</label>
                                        <textarea name="inscriptionText" rows="3" value={formData.inscriptionText} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                                    </div>
                                )}
                            </FormSection>

                            <FormSection title="Additional Items & Notes">
                                 <CheckboxField name="hasExtras" label="Additional Items Included" checked={formData.hasExtras} onChange={handleChange} fullWidth={true} />
                                 {formData.hasExtras && (
                                     <div className="sm:col-span-2 space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                         <p className="text-sm font-medium text-gray-900 dark:text-gray-200">Select included items:</p>
                                         <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                         {extraOptions.map(opt => (
                                             <CheckboxField key={opt} label={opt} checked={formData.extras.includes(opt)} onChange={() => handleExtrasChange(opt)} />
                                         ))}
                                         </div>
                                     </div>
                                 )}
                                 <CheckboxField name="hasNotes" label="Add Notes" checked={formData.hasNotes} onChange={handleChange} fullWidth={true}/>
                                 {formData.hasNotes && (
                                     <div className="sm:col-span-2">
                                         <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                                         <textarea name="notes" rows="4" value={formData.notes} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                                     </div>
                                 )}
                            </FormSection>

                             <FormSection title="Documentation Image URLs">
                                <p className="text-sm text-gray-500 dark:text-gray-400 sm:col-span-2">Provide URLs for any documentation images you have. You can host these on an image service like Imgur.</p>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title Page URL</label><input type="text" name="titlePageUrl" value={formData.titlePageUrl} onChange={handleChange} className={inputStyle} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verso Page URL</label><input type="text" name="versoPageUrl" value={formData.versoPageUrl} onChange={handleChange} className={inputStyle} /></div>
                                <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">List of Plates URL</label><input type="text" name="platesListPageUrl" value={formData.platesListPageUrl} onChange={handleChange} className={inputStyle} /></div>
                            </FormSection>

                        </div>

                        {/* Form Actions */}
                        <div className="mt-8 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700 pt-6">
                            <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Cancel</button>
                            <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Save Book</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const BookCard = ({ book, onEdit, onDelete }) => {
    const fallbackImage = `https://placehold.co/300x450/4B5563/FFFFFF?text=${encodeURIComponent(book.title)}`;

    return (
        <div className="group relative flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="aspect-w-2 aspect-h-3">
                <img 
                    src={book.coverImageUrl || fallbackImage} 
                    alt={`Cover of ${book.title}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                />
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                 <button onClick={() => onEdit(book)} className="p-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>
                 </button>
                 <button onClick={() => onDelete(book.id)} className="p-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full text-red-500 hover:bg-white dark:hover:bg-gray-900">
                    <Icon name="trash" className="w-4 h-4"/>
                 </button>
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate" title={book.title}>{book.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{book.author || 'Unknown Author'}</p>
                </div>
                <div className="mt-3">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        book.category === 'Available' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        book.category === 'Sold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                     }`}>
                        {book.category}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Main App Component
export default function App() {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    
    const [books, setBooks] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) return savedTheme;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });
    
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    // --- Theme Management ---
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };


    // --- Firebase Initialization ---
    useEffect(() => {
        try {
            // --- PASTE YOUR FIREBASE KEYS HERE ---
            // Replace the placeholder values with your actual keys from the Firebase console.
            const firebaseConfig = {
                apiKey: "AIzaSyDIPmU32FpOFgjvG2htkSPghV5TU54cYhk",
  authDomain: "book-inventory-app-22cb2.firebaseapp.com",
  projectId: "book-inventory-app-22cb2",
  storageBucket: "book-inventory-app-22cb2.firebasestorage.app",
  messagingSenderId: "950701789644",
  appId: "1:950701789644:web:53749184d9a7dc161b4d69",
  measurementId: "G-KYZQP07DX3"
            };
            // --- END OF KEYS SECTION ---

            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const authInstance = getAuth(app);
            
            setDb(firestore);
            setAuth(authInstance);

            onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                   await signInAnonymously(authInstance).catch(error => {
                        console.error("Anonymous sign-in failed:", error);
                    });
                }
                setIsAuthReady(true);
            });
        } catch (error) {
            console.error("Error initializing Firebase:", error);
        }
    }, []);

    // --- Data Fetching ---
    useEffect(() => {
        if (!isAuthReady || !db || !userId) return;

        setIsLoading(true);
        const booksCollectionPath = `artifacts/${appId}/users/${userId}/books`;
        const booksCollectionRef = collection(db, booksCollectionPath);
        
        const unsubscribe = onSnapshot(booksCollectionRef, (snapshot) => {
            const booksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBooks(booksData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching books:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [isAuthReady, db, userId, appId]);

    // --- Data Manipulation ---
    const handleSaveBook = async (bookData) => {
        if (!db || !userId) return;
        
        const booksCollectionPath = `artifacts/${appId}/users/${userId}/books`;
        try {
            if (bookData.id) { // Editing existing book
                const bookRef = doc(db, booksCollectionPath, bookData.id);
                const { id, ...dataToUpdate } = bookData;
                await setDoc(bookRef, dataToUpdate, { merge: true });
            } else { // Adding new book
                const booksCollectionRef = collection(db, booksCollectionPath);
                await addDoc(booksCollectionRef, { ...bookData, createdAt: serverTimestamp() });
            }
            setIsFormVisible(false);
            setEditingBook(null);
        } catch (error) {
            console.error("Error saving book:", error);
            alert("Failed to save book. See console for details.");
        }
    };
    
    const handleDeleteBook = async (bookId) => {
       if (!db || !userId) return;
       // A custom modal would be better than window.confirm for a PWA
       if (window.confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
           try {
               const bookRef = doc(db, `artifacts/${appId}/users/${userId}/books`, bookId);
               await deleteDoc(bookRef);
           } catch (error) {
               console.error("Error deleting book: ", error);
               alert("Failed to delete book.");
           }
       }
    };
    
    const handleEditBook = (book) => {
        setEditingBook(book);
        setIsFormVisible(true);
    };

    const handleAddNewClick = () => {
        setEditingBook(null);
        setIsFormVisible(true);
    };

    // --- Filtering and Searching ---
    const filteredBooks = books
        .filter(book => filter === 'All' || book.category === filter)
        .filter(book => 
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase()))
        );

    const getCategoryCount = useCallback((category) => {
        return books.filter(b => b.category === category).length;
    }, [books]);

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200">
            <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <Icon name="book" className="w-8 h-8 text-indigo-600" />
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book Inventory</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={handleAddNewClick} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition">
                                <Icon name="plus" className="w-5 h-5"/>
                                <span>Add New Book</span>
                            </button>
                            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition">
                                {theme === 'light' ? <Icon name="moon" /> : <Icon name="sun" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters and Search Bar */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="relative md:col-span-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon name="search" className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by title or author..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex items-center justify-center space-x-2 md:col-span-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                           {['All', 'Available', 'Sold', 'Personal'].map(cat => (
                               <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-full transition ${filter === cat ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                   {cat} {cat !== 'All' && `(${getCategoryCount(cat)})`}
                               </button>
                           ))}
                        </div>
                    </div>
                </div>

                {/* Books Grid */}
                {isLoading && <p className="text-center py-10">Loading your library...</p>}
                
                {!isLoading && filteredBooks.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {filteredBooks.map(book => (
                            <BookCard key={book.id} book={book} onEdit={handleEditBook} onDelete={handleDeleteBook}/>
                        ))}
                    </div>
                )}
                
                {!isLoading && filteredBooks.length === 0 && (
                     <div className="text-center py-16 px-4">
                        <Icon name="book" className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No books found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? `Your search for "${searchTerm}" did not match any books.` : `Your library is empty. Add your first book!`}
                        </p>
                        <div className="mt-6">
                             <button onClick={handleAddNewClick} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition">
                                <Icon name="plus" className="w-5 h-5"/>
                                <span>Add New Book</span>
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {isFormVisible && (
                <BookForm 
                    book={editingBook} 
                    onSave={handleSaveBook} 
                    onCancel={() => { setIsFormVisible(false); setEditingBook(null); }}
                />
            )}
        </div>
    );
}
