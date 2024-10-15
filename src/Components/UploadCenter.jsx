import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import "./UploadBox.css";

const UploadBox = ({ uploadedImage, setUploadedImage, setProbabilities }) => {
	const { getRootProps, getInputProps, open } = useDropzone({
		onDrop: (acceptedFiles) => {
			const file = acceptedFiles[0];
			const reader = new FileReader();
			reader.onload = () => {
				const img = new Image();
				img.src = reader.result;
				img.onload = () => {
					const croppedImage = centerCropAndResize(img, 500, 500); // Perform smart resize
					setUploadedImage(croppedImage);
					// Start model prediction after image upload
					handleModelPrediction(croppedImage);
				};
			};
			reader.readAsDataURL(file);
		},
		noClick: false, // Enable clicking to upload
	});

	// Helper function to perform smart resize (center crop)
	const centerCropAndResize = (img, width, height) => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const size = Math.min(img.width, img.height);
		const offsetX = (img.width - size) / 2;
		const offsetY = (img.height - size) / 2;

		canvas.width = width;
		canvas.height = height;
		ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, width, height);
		return canvas.toDataURL();
	};

	// Handle model prediction
	const handleModelPrediction = async (image) => {
		// setLoading(true); // Set loading state to true

		// Convert image to Blob for sending
		const response = await fetch(image);
		const blob = await response.blob();
		const formData = new FormData();
		formData.append("image", blob, "uploaded_image.png");

		const res = await fetch("http://localhost:5000/predict", {
			method: "POST",
			body: formData,
		});

		const predictions = (await res.json())[0];
		console.log(predictions);
		setProbabilities(predictions);
		// setLoading(false); // Reset loading state
	};

	return (
		<div className="upload-box-wrapper">
			<div
				className="upload-box"
				{...getRootProps()}
				style={{ cursor: "pointer" }}
			>
				<input {...getInputProps()} />
				{uploadedImage ? (
					<img
						src={uploadedImage}
						alt="Uploaded"
						className="uploaded-image"
					/>
				) : (
					<p>Drag & drop an image, or click to select one</p>
				)}

				{/* SVG marching ants dashed border */}
				<svg className="svg-border" viewBox="0 0 560 560">
					<rect
						x="10"
						y="10"
						width="540"
						height="540"
						stroke="orange"
						strokeWidth="5"
						strokeDasharray="15,10"
						fill="none"
						className="marching-ants-border"
					/>
				</svg>
			</div>

			{/* Re-Upload Button */}
			{uploadedImage && (
				<ReUploadButton
					setUploadedImage={setUploadedImage}
					openFileDialog={open}
					setProbabilities={setProbabilities}
				/>
			)}
		</div>
	);
};

const ReUploadButton = ({
	setUploadedImage,
	openFileDialog,
	setProbabilities,
}) => {
	const handleReUpload = () => {
		setUploadedImage(null); // Clear the current image
		setProbabilities(null);
		openFileDialog(); // Open file manager for new image selection
	};

	return (
		<div className="re-upload-button-container">
			<button className="upload-again-button" onClick={handleReUpload}>
				Upload a Different Image
			</button>
		</div>
	);
};

const UploadBoxWithProbabilities = () => {
	const [uploadedImage, setUploadedImage] = useState(null);
	const [probabilities, setProbabilities] = useState(null); // No probabilities by default

	let maxIndex = probabilities
		? probabilities.indexOf(Math.max(...probabilities))
		: -1;

	return (
		<div className="container">
			<div className="image-and-probabilities">
				{/* Upload Box */}
				<UploadBox
					uploadedImage={uploadedImage}
					setUploadedImage={setUploadedImage}
					setProbabilities={setProbabilities}
				/>

				{/* Probability Boxes */}
				<div className="probability-container">
					{[
						"Actinic keratosis",
						"Basal cell carcinoma",
						"Benign keratosis",
						"Dermatofibroma",
						"Melanoma",
						"Nevus",
						"Vascular lesion",
					].map((label, index) => (
						<div
							className={`probability-box ${
								index == maxIndex
									? "probability-box-shadow"
									: ""
							}`}
							key={index}
						>
							<p>{label}</p>
							<p>
								{!probabilities
									? "..."
									: `${(probabilities[index] * 100).toFixed(
											2
									  )}%`}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default UploadBoxWithProbabilities;
