import { useSelector } from "react-redux";
import styles from "../../../styles/CompanyInfo.module.css";
import { Apartment, Store, Key, Edit, Business, LocationOn, Link } from '@mui/icons-material';
import defaultCompanyImage from '../../../assets/noprofilephoto.png';

const CompanyInfo = () => {
    const userData = useSelector((state) => state.user?.user);
    const companyDetails = {
        "company_id": 6,
        "company_name": "FoodiesHub",
        "company_industry": "Food & Beverage",
        "company_description": "Revolutionizing food delivery with innovative technology and exceptional customer service. We connect hungry customers with the best local restaurants through our platform. Founded in 2018, we've grown to serve over 1 million customers across North America.",
        "company_image": null,
        "company_secret_key": "secret_key6"
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.logoContainer}>
                    <img 
                        src={companyDetails.company_image || defaultCompanyImage} 
                        alt={companyDetails.company_name}
                        className={styles.companyLogo}
                    />
                </div>
                <div className={styles.headerInfo}>
                    <h1 className={styles.companyName}>{companyDetails.company_name}</h1>
                    <p className={styles.industry}>
                        <Store className={styles.icon} />
                        {companyDetails.company_industry}
                    </p>
                </div>
                <button className={styles.editButton}>
                    <Edit /> Edit Company
                </button>
            </div>

            <div className={styles.content}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>About Our Company</h2>
                    <div className={styles.sectionContent}>
                        <p className={styles.description}>
                            {companyDetails.company_description}
                        </p>
                        <div className={styles.paragraphGroup}>
                            <p>
                                Contrary to popular belief, FoodiesHub is not just another food delivery service. 
                                We have revolutionized the industry with our proprietary matching algorithm that 
                                connects customers with restaurants based on their unique preferences and dietary needs.
                            </p>
                            <p>
                                Our technology platform handles over 50,000 orders daily with 99.9% reliability. 
                                We partner with over 5,000 restaurants nationwide to bring you the best dining 
                                experience right to your doorstep.
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Company Credentials</h2>
                    <div className={styles.sectionContent}>
                        <div className={styles.credentialsGrid}>
                            <div className={styles.credentialItem}>
                                <h3 className={styles.credentialTitle}>
                                    <Key className={styles.credentialIcon} />
                                    Secret Key
                                </h3>
                                <div className={styles.secretKeyContainer}>
                                    <input
                                        type="password"
                                        value={companyDetails.company_secret_key}
                                        readOnly
                                        className={styles.secretKeyInput}
                                    />
                                    <button 
                                        className={styles.copyButton}
                                        onClick={() => {
                                            navigator.clipboard.writeText(companyDetails.company_secret_key);
                                            alert('Secret key copied to clipboard!');
                                        }}
                                    >
                                        Copy
                                    </button>
                                </div>
                                <p className={styles.secretKeyNote}>
                                    This key is used to verify company ownership. Keep it secure and don't share it publicly.
                                </p>
                            </div>
                            
                            <div className={styles.credentialItem}>
                                <h3 className={styles.credentialTitle}>
                                    <Business className={styles.credentialIcon} />
                                    Company ID
                                </h3>
                                <div className={styles.companyId}>
                                    {companyDetails.company_id}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyInfo;