// reusing styles from tos
import cls from './TermsOfService.module.css';
import clsx from 'clsx';

export function PrivacyPolicy() {
	return (
		<article className={cls.root}>
			<header className={cls.common}>
				<div className={cls.commonOverlay}>
					<h1>Privacy Policy</h1>
					<p>Effective on June 6th, 2024</p>
				</div>
			</header>

			<main>
				<section className={clsx(cls.padded)}>
					<div className={cls.twoColumnsText}>
						<h2>Your Privacy Matters</h2>
						<p>
							Thank you for using alef, our immersive 3D application ("App") available on Meta platforms and other devices, and for visiting https://alef.io ("Website"). These
							services are collectively referred to within as the "Services", owned and operated by Volumetrics, Inc. ("Volumetrics", "we", "us"). By using or accessing our
							Services in any way, including through Meta platforms, you acknowledge that you accept the practices and policies outlined in this Privacy Policy, and you hereby
							consent to our collection, use, and sharing of your information as described herein.
						</p>
						<p>
							We are committed to respecting and protecting your privacy. Please read this Privacy Policy carefully to understand what information we collect about users of our
							Services, how we use that information, and your rights regarding your personal information. If you do not agree with the content of this Privacy Policy, please do not
							use our Services. We encourage you to check our Website frequently to see the current Privacy Policy and Terms and Conditions of Use in effect and any changes that
							may have been made to them. If we make material changes to this Privacy Policy, we will notify you by posting the revised Privacy Policy and the revised effective
							date on our Website, by sending you an e-mail, and/or by other means within the App. Please note that if you've opted not to receive legal notice emails from us (or
							you haven't provided us with your email address), those legal notices will still govern your use of the Services, and you are still responsible for reading and
							understanding them. If you use the Services after any changes to the Privacy Policy have been posted, this means you agree to all of the changes. This Policy is part
							of our{' '}
							<a className={cls.textLink} href="/terms-of-service">
								Terms and Conditions of Use
							</a>
							.
						</p>
						<p>
							This Privacy Policy covers our treatment of your personal information and user-generated content that we gather when you are accessing or using our Services,
							including any code, assets, 3D content, or other content you upload, post, transmit, or otherwise make available via the App or Website. This policy applies to all
							platforms where our App is available, including Meta platforms. It does not apply to the practices of companies we don't own or control, or people that we don't
							manage.
						</p>
					</div>
				</section>
				<section className={clsx(cls.padded)}>
					<div className={cls.twoColumnsText}>
						<h2>Collection of Information</h2>
						<p>
							We collect information you provide directly to us when you register for an account, create or modify your profile, upload or share content, participate in interactive
							features, request customer support, or otherwise communicate with us through the App or Website.
						</p>
						<p>We also collect information automatically when you access or use our Services. This may include:</p>
						<ul>
							<li>
								<strong>Usage Information:</strong> We collect information about your interactions with our Services, such as the content you view, the 3D environments you create
								or explore, the code you write or remix, and the features you use within the App.
							</li>
							<li>
								<strong>Device Information:</strong> We collect information about the computer, mobile device, or VR headset you use to access our Services, including the hardware
								model, operating system and version, and network information.
							</li>
							<li>
								<strong>Log Information:</strong> We collect log information about your use of the Services, including your IP address, access times, browser type and language,
								Internet Service Provider, pages viewed, app features accessed, and the page you visited before navigating to our app.
							</li>
							<li>
								<strong>Cookies and Similar Technologies:</strong> We use cookies and similar tracking technologies to collect information about your use of the app and to remember
								your preferences.
							</li>
							<li>
								<strong>VR and Meta Platform Data:</strong> When you use alef on Meta platforms, we may collect additional information specific to your VR experience, such as
								movement data, controller inputs, and interaction patterns within the App.
							</li>
						</ul>
						<p>
							Your browser may offer you a "Do Not Track" option, which allows you to signal to operators of websites and web applications that you do not wish such operators to
							track certain of your online activities. Our Services do not currently respond to "Do Not Track" signals.
						</p>
					</div>
				</section>
				<section className={clsx(cls.padded)}>
					<div className={cls.twoColumnsText}>
						<h2>Use of Information</h2>
						<p>We may use the information we collect for various purposes, including to:</p>
						<ul>
							<li>Provide, maintain, and improve our App, Website, and Services.</li>
							<li>Process transactions and send you related information, including confirmations and invoices.</li>
							<li>Send you technical notices, updates, security alerts, and support and administrative messages.</li>
							<li>Respond to your comments, questions, and requests, and provide customer service.</li>
							<li>Monitor and analyze trends, usage, and activities in connection with our Services.</li>
							<li>Detect, investigate, and prevent fraudulent transactions and other illegal activities, and protect the rights and property of Volumetrics and others.</li>
							<li>Personalize and improve the Services and provide advertisements, content, or features that match user profiles or interests.</li>
							<li>Facilitate sharing of content and user collaboration within the App.</li>
							<li>Enhance the functionality and user experience of alef on Meta platforms and other devices.</li>
							<li>Carry out any other purpose for which the information was collected.</li>
						</ul>
					</div>
				</section>
				<section className={clsx(cls.padded)}>
					<div className={cls.twoColumnsText}>
						<h2>Sharing of Information</h2>
						<p>We may share personal information as follows or as otherwise described in this Privacy Policy:</p>
						<ul>
							<li>
								With other users of the Services when you post content publicly or interact with public areas of the App or Website. Your profile information and any content you
								upload or share in these areas may be viewed and used by others.
							</li>
							<li>With third-party vendors, consultants, and other service providers who need access to your information to carry out work on our behalf.</li>
							<li>With Meta Platforms, Inc. and its affiliates as necessary to provide and maintain the App on Meta platforms, subject to their privacy policies and terms.</li>
							<li>In response to a request for information if we believe disclosure is in accordance with, or required by, any applicable law, regulation, or legal process.</li>
							<li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of Volumetrics or others.</li>
							<li>
								In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company.
							</li>
							<li>With your consent or at your direction.</li>
						</ul>
						<p>We may also share aggregated or de-identified information, which cannot reasonably be used to identify you.</p>
					</div>
				</section>
				<section className={clsx(cls.padded)}>
					<div className={cls.twoColumnsText}>
						<h2>Children's Privacy</h2>
						<p>
							We are committed to protecting the privacy of young children. Our Services are not directed to children under the age of 16, and we do not knowingly collect personal
							information from children under 16. If we become aware that a child under 16 has provided us with personal information, we will take steps to delete such information.
						</p>
					</div>
				</section>
				<section className={clsx(cls.padded)}>
					<div className={cls.twoColumnsText}>
						<h2>International Data Transfers</h2>
						<p>
							Volumetrics is based in the United States, and we process and store information in the U.S. As such, your information may be transferred to, stored, or processed in
							the United States or other countries where we or our service providers maintain facilities. By using the Services, you consent to the transfer of information to
							countries outside your country of residence, which may have different data protection rules than your country.
						</p>
					</div>
				</section>
				<section className={clsx(cls.padded)}>
					<div className={cls.twoColumnsText}>
						<h2>Platform-Specific Policies</h2>
						<p>
							When using alef on Meta platforms, your use is also subject to Meta's Privacy Policy and Terms of Service. We recommend reviewing Meta's policies regarding data
							collection and use on their platforms:
							<a className={cls.textLink} href="https://www.meta.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">
								{' '}
								Meta Privacy Policy
							</a>
							.
						</p>
					</div>
				</section>
				<section className={clsx(cls.padded)}>
					<div className={cls.twoColumnsText}>
						<h2>Linked Websites and Services</h2>
						<p>
							Our Services may contain links or otherwise provide access to third-party websites and services. We have no control over the policies and practices of third-party
							websites or businesses as to privacy or anything else and are not responsible for the privacy practices of such other websites or services. We encourage users to be
							aware when they leave our App or Website and to read the privacy statements of each website they visit that collects personal information. This Privacy Policy applies
							solely to information collected through our Services.
						</p>
					</div>
				</section>
				<section className={clsx(cls.padded)}>
					<div className={cls.twoColumnsText}>
						<h2>Contacting Us</h2>
						<p>Please feel free to contact us if you have any questions about our Privacy Policy or practices. You may contact us by mail at:</p>
						<p>
							Volumetrics, Inc
							<br />
							1337 Natoma St #3
							<br />
							San Francisco, CA 94103
							<br />
						</p>
						<br />
						<p>
							By email:{' '}
							<a className={cls.textLink} href="mailto:legal@volumetrics.io">
								legal@volumetrics.io
							</a>
						</p>
					</div>
				</section>
			</main>
		</article>
	);
}
