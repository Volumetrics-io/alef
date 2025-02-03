# Device pairing and authentication flow

A series of requests is used to register devices to users in the system. These requests are routed to shared Durable Objects based on public IP, which act as the central coordinating state for the exchange.

The objective of the exchange is to make the UX of logging into a headset much easier, so that upon initial setup, and any loss of authentication (storage wipe, expiration, etc), the process is simple for non-technical users.

Since both headset and external device are involved in the process, we also want to avoid the need to remove the headset to type or read something. We attempt to leverage the usable but low-resolution passthrough by making the prompts on the external device large and easily actionable without close inspection.

For security, we want to ensure a couple things:

- Devices are only paired with explicit consent of the user assigning them to their account
- The user knows which device they are approving
- The opportunity for pairing a device only exists while the user is actively engaged in the process (no ability to 'claim' a pairing begun at an earlier time)
- Once paired, the device can refresh its short-lived authentication status like any other normal client, and has all the rights of a client device
- The ability of the device to refresh its authentication does not rely on any information exposed on the device itself; i.e. it's not some device-stored password which could be stolen and reused elsewhere to impersonate that device

## The process

For the sake of description, the 'passive device' being paired and authenticated is referred to as a Headset (it doesn't have to necessarily be an XR headset), and the pre-authenticated device facilitating the pair is called the Phone (again, might not be a phone).

1. The user logs into their account via normal auth methods on their phone
2. The user powers their headset and opens the app
3. The headset app detects it is not logged in and prompts the user to pair to a logged in device. It begins polling `/devices/discovery` to be informed of such devices.
4. The user is instructed to open their phone and visit the Devices page. On this page, the phone also begins polling `/devices/discovery`.
5. When a device of any kind polls `/devices/discovery`, it is assigned a unique ID via a _signed_ cookie. So devices may only receive an ID, not self-assign, and cannot alter their ID.
6. Once more than one device is connected on the same IP, the phone should show up on the list of options in the headset UI. The user selects their phone, which has a name like "Grant's Android Device," inferred from the logged-in user and OS.
7. Once the phone is selected, a "suggestion" is generated via the API from the headset. This is stored in ephemeral DO state.
8. The next time the phone polls discovery, it sees the suggestion and presents this to the user on the phone. This takes the form of a large UI with a button to accept the connection request.
9. Once the request is accepted, this is logged again in the DO state via an API call. The headset is officially paired to the user's account.
10. When the headset next polls `/devices/discovery`, its paired status is recognized and it is assigned a normal authentication JWT on behalf of the user it is assigned to.
11. A flag in the discovery payload prompts the headset to revalidate the original "am I logged in" query. Now equipped with the token, the query succeeds, and the device exits discovery mode.
