import { React, useState } from "react";
import "./App.css";
import UploadCenter from "./Components/UploadCenter";

const App = () => {
	return (
		<div className="app-container">
			<h1 className="title">SkinSense</h1>
			<h3 className="title small">advanced skin lesion diagnosis</h3>
			<UploadCenter className="upload" />
		</div>
	);
};

export default App;
