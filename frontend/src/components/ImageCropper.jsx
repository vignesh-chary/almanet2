import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check } from 'lucide-react';

function ImageCropper({ image, onCropComplete, onClose }) {
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const imgRef = useRef(null);
    const previewCanvasRef = useRef(null);

    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        const crop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                1,
                width,
                height
            ),
            width,
            height
        );
        setCrop(crop);
    }

    async function handleCropComplete() {
        if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
            console.error('Missing required elements for cropping');
            return;
        }

        const image = imgRef.current;
        const canvas = previewCanvasRef.current;
        const crop = completedCrop;

        const outputSize = 400;
        canvas.width = outputSize;
        canvas.height = outputSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get canvas context');
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const sourceX = crop.x * scaleX;
        const sourceY = crop.y * scaleY;
        const sourceWidth = crop.width * scaleX;
        const sourceHeight = crop.height * scaleY;

        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        ctx.clip();

        ctx.drawImage(
            image,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            outputSize,
            outputSize
        );

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    console.error('Failed to create blob from canvas');
                    return;
                }
                onCropComplete(blob);
                onClose();
            },
            'image/jpeg',
            0.95
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-card-dark p-6 rounded-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-text dark:text-text-dark">Crop Image</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4">
                    <ReactCrop
                        crop={crop}
                        onChange={setCrop}
                        onComplete={setCompletedCrop}
                        aspect={1}
                        circularCrop
                    >
                        <img
                            ref={imgRef}
                            src={image}
                            onLoad={onImageLoad}
                            alt="Crop me"
                            className="w-full h-full object-cover"
                        />
                    </ReactCrop>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCropComplete}
                        className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
                    >
                        <Check size={20} />
                        Apply
                    </button>
                </div>

                <canvas
                    ref={previewCanvasRef}
                    style={{
                        display: 'none',
                    }}
                />
            </div>
        </div>
    );
}

export default ImageCropper;