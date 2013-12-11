-- Role required to use the registration application
insert into role (role, description) values ('RegistrationClerk', 'RegistrationClerk');


-- Privileges for registrationClerk
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'Add Observations');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'Add Patient Identifiers');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'Add Patients');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'Add People');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'Add Visits');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'Edit Encounters');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'Edit Patient Identifiers');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'Edit Patients');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'Edit People');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'Edit Visits');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'Manage Address Hierarchy');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Administration Functions');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Concepts');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Encounter Types');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Encounters');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Global Properties');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Identifier Types');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Location Attribute Types');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Locations');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Navigation Menu');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Observations');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Patient Identifiers');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Patients');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View People');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Person Attribute Types');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Providers');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Users');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Visit Attribute Types');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Visit Types');
insert into role_privilege (role, privilege) values ('RegistrationClerk', 'View Visits');