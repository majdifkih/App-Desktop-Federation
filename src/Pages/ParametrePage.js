import React, { useState } from "react";
import { Link } from "react-router-dom";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import InfoIcon from '@mui/icons-material/Info';
import SideBar from "../Components/SideBar";
import './ParametrePage.css';
import InformationsCompte from "./InformationsCompte";
import ConfigurationCompte from "./ConfigurationCompte";
import { Tabs } from 'antd';

const ParametrePage = () => {
    const [activeTab, setActiveTab] = useState("0");

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    return (
        <div style={{ marginLeft: "300px" }}>
            <SideBar />
            <div>
               <h1 className="title-param">Paramétre du compte</h1>
                <div className="tab-content">
                <Tabs
                        activeKey={activeTab}
                        onChange={handleTabChange}
                        tabPosition="left"
                        style={{ height: "100%" }}
                    >
                        <Tabs.TabPane
                            tab={
                                <span className={`tab-label ${activeTab === "0" ? "active" : ""}`}>
                                    <ManageAccountsIcon/> Configuration du compte
                                </span>
                            }
                            key="0"
                        >
                            <div className="tab-pane-content">
                                <ConfigurationCompte />
                            </div>
                        </Tabs.TabPane>
                        <Tabs.TabPane
                            tab={
                                <span className={`tab-label ${activeTab === "1" ? "active" : ""}`}>
                                   <InfoIcon/> Informations du compte
                                </span>
                            }
                            key="1"
                        >
                            <div className="tab-pane-content">
                                <InformationsCompte />
                            </div>
                        </Tabs.TabPane>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

export default ParametrePage;
