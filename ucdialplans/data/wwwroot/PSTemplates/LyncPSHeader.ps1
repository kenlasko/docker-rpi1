<#
.SYNOPSIS
A script to automatically create all necessary components for a Skype for Business Enterprise Voice deployment.

.DESCRIPTION
Automates the creation of Lync/Skype for Business Enterprise Voice dial plans, voice policies, routes, and PSTN usages.

This script generated for {strLocationName} {strNPANXX}

.PARAMETER SiteID
OPTIONAL. The numeric identifier associated with the Lync/Skype for Business site to apply the script to.
If a value is not provided, script will ask during execution.
To see a list of sites and the associated site IDs, run Get-CSSite

.PARAMETER DialPlanType
OPTIONAL. Create a site-level or user-level dialplan. Site-level applies to all users at a site, while user-level have to be explicitly applied.
Possible values are 'Site' or 'User'. If a value is not provided, script will ask during execution.

.PARAMETER LeastCostRouting
OPTIONAL. Either apply or don't apply least cost routing to the given site.
Only applies if multiple UCDialPlans.com generated rulesets are detected.
If a value is not provided (and multiple rulesets are detected), script will ask during execution.

.PARAMETER LCRSites
OPTIONAL. Apply least-cost/failover routing only to defined sites.
Only applies if multiple UCDialPlans.com generated rulesets are detected.  Site names must be separated by commas.

.PARAMETER OverwriteSiteVoicePolicy
OPTIONAL. Overwrite any existing site-level voice policy if values are already there.
Only applies if a site-level voice policy exists. If a value is not provided, script will ask during execution, if necessary.

.PARAMETER LocationBasedRouting
OPTIONAL. Apply location-based routing to a selected site.
Only applies if Lync/Skype for Business network sites have been created. If a value is not provided, script will ask during execution, if necessary.

.PARAMETER LBRNetworkSite
OPTIONAL. The name of the Lync/Skype for Business network site to apply location-based routing.
Only applies if Lync/Skype for Business network sites exist. For a list of Lync/Skype for Business network sites, run Get-CSNetworkSite.
Works in conjunction with LocationBasedRouting parameter. If a value is not provided, script will ask during execution,
if network sites exist, and the user selects location-based routing.

.PARAMETER LocalOnly
OPTIONAL. Only create local/service rules for the selected site
This option is useful when creating dial rules for remote sites that use a central SIP trunk for all calls, and you want to create local-only voice polices/routes.
Command line only option.

.PARAMETER DPOnly
OPTIONAL. Only create dial plan
This option is useful for when all required routes/PSTN usages already exist, and you require separate dialplans for different groups.
Command line only option.

.PARAMETER MediationPool
OPTIONAL. The FQDN of a mediation pool to apply the script to.
Only applies if multiple mediation pools exist within the selected site.
If a value is not provided and multiple mediation pools exist, script will ask during execution.

.PARAMETER PSTNGateway
OPTIONAL The FQDN of a PSTN gateway/trunk to apply the script to.
Only applies if multiple PSTN gateways/trunks are assigned to the selected mediation pool.
If a value is not provided and multiple PSTN gateways/trunks exist, script will ask during execution.

.PARAMETER ApplicationPool
OPTIONAL. The FQDN of an application pool to apply the script to.
Only applies if multiple application pools exist within the selected site, and call park or premium call blocking is being used.
If a value is not provided and multiple application pools exist, and either call park or premium call blocking is being used, 
script will ask during execution.

.EXAMPLE
.\{strFileName}
Runs the script in interactive mode. Script will prompt user for information when required.

.EXAMPLE
.\{strFileName} -SiteID 1 -DialPlanType User
Applies the script to Lync/Skype for Business site #1, and creates user-level dialplans. Script will prompt user for other information when required.

.EXAMPLE
.\{strFileName} -SiteID 1 -DialPlanType User -LeastCostRouting:$FALSE -OverwriteSiteVoicePolicy:$FALSE -LocationBasedRouting:$FALSE
Applies the script to Lync/Skype for Business site #1, and creates user-level dialplans, and doesn't do least-cost routing or location-based routing.
Script runs in full automated mode, in circumstances where there aren't multiple mediation pools/PSTN gateways etc.

.EXAMPLE
.\{strFileName} -SiteID 2 -DialPlanType User -LeastCostRouting:$TRUE -LCRSites 'US-NY-NewYorkCity,UK-London,SG-Singapore'
Applies the script to Lync/Skype for Business site #1, and creates user-level dialplans. Will apply least-cost/failover routing using only the sites specified.
Script will prompt user for other information when required.

.EXAMPLE
.\{strFileName} -SiteID 1 -MediationPool LyncMedPool02.contoso.com
Applies the script to Lync/Skype for Business site #1, and applies the routes to LyncMedPool02.
Script will prompt user for additional information when required.

.LINK
https://ucken.blogspot.com/2012/01/complete-guide-to-lync-optimizer.html

.NOTES
 -Script must be run locally from a Lync/Skype for Business server (not remote shell).
 -Works on all versions of Lync/Skype for Business from 2010 and newer (location-based routing features requires Lync 2013 CU1 or higher)

Generated by UCDialPlans.com v.{cVersion} on {CurrentDate}
Copyright {strCopyrightYear} by Ken Lasko. Do not reproduce without permission.
https://www.ucdialplans.com
https://ucken.blogspot.com
You must read and abide by the terms of service at https://www.ucdialplans.com/termsofservice.htm

To import the rules into Lync/Skype for Business, please save this file as a .ps1 (Powershell script). 
Before running this script, make sure you've defined a PSTN gateway in your topology for the selected site, and that you've backed up
your existing Enterprise Voice configuration.

Run the program from Lync/Skype for Business Powershell by typing .\{strFileName}
#>


# The below settings are for applying command line options for unattended script application
param (
	# Input the site ID's numeric assignment.  Use Get-CSSite to show the site names and their number
	[Parameter(ValueFromPipeline = $False, ValueFromPipelineByPropertyName = $True)]
	[ValidateNotNullOrEmpty()]
	[ValidatePattern('^\d{1,2}$')]
	[int] $SiteID,

	# Create site-level or user level dial plans.
	[Parameter(ValueFromPipeline = $False, ValueFromPipelineByPropertyName = $True)]
	[ValidateNotNullOrEmpty()]
	[ValidateSet('Site','User')]
	[string] $DialPlanType,

	# Perform least-cost/failover routing on the voice policies.
	[Parameter(ValueFromPipeline = $False, ValueFromPipelineByPropertyName = $True)]
	[ValidateNotNullOrEmpty()]
	[switch] $LeastCostRouting,

	# Apply least-cost/failover routing only to rulesets defined in this list. Separate site names with commas and enclose the entire set in quotes. Input site names exactly the same as the prefix for the desired site (ie CA-ON-Toronto, UK-London etc).
	[Parameter(ValueFromPipeline = $False, ValueFromPipelineByPropertyName = $True)]
	[ValidateNotNullOrEmpty()]
	[ValidatePattern('^(\w\w\-[\w\-]*\,?)+$')]
	[string] $LCRSites,

	# Overwrite any existing values in an existing site-level voice policy.
	[Parameter(ValueFromPipeline = $False, ValueFromPipelineByPropertyName = $True)]
	[ValidateNotNullOrEmpty()]
	[switch] $OverwriteSiteVoicePolicy,

	# Apply location-based routing to a network site. Only appears if network sites have been defined.
	[Parameter(ValueFromPipeline = $False, ValueFromPipelineByPropertyName = $True)]
	[ValidateNotNullOrEmpty()]
	[switch] $LocationBasedRouting,

	# Site name to apply location-based routing to. Use Get-CSNetworkSite for a list
	[Parameter(ValueFromPipeline = $False, ValueFromPipelineByPropertyName = $True)]
	[ValidateNotNullOrEmpty()]
	[string] $LBRNetworkSite,

	# Create local-only voice policies/routes for the selected site.
	[Parameter(ValueFromPipeline = $False, ValueFromPipelineByPropertyName = $True)]
	[ValidateNotNullOrEmpty()]
	[switch] $LocalOnly,

	# Create only a dial plan. No routes/PSTN usages etc.
	[Parameter(ValueFromPipeline = $False, ValueFromPipelineByPropertyName = $True)]
	[ValidateNotNullOrEmpty()]
	[switch] $DPOnly,

	# Input the mediation pool name. Only necessary if multiple mediation pools are assigned to a site
	[Parameter(ValueFromPipeline = $False, ValueFromPipelineByPropertyName = $True)]
	[ValidateNotNullOrEmpty()]
	[string] $MediationPool,

	# Input the PSTN Gateway name. Only necessary if multiple PSTN gateways are assigned to a mediation pool
	[Parameter(ValueFromPipeline = $False, ValueFromPipelineByPropertyName = $True)]
	[ValidateNotNullOrEmpty()]
	[string] $PSTNGateway,

	# Input the application pool name. Only necessary if multiple application pools are assigned to a site and you are using call park or block premium number feature
	[Parameter(ValueFromPipeline = $False, ValueFromPipelineByPropertyName = $True)]
	[ValidateNotNullOrEmpty()]
	[string] $ApplicationServer
)


# $ErrorActionPreference can be set to SilentlyContinue, Continue, Stop, or Inquire for troubleshooting purposes
$Error.Clear()
$ErrorActionPreference = 'SilentlyContinue'

If ((Get-Module Lync) -eq $null){Import-Module Lync}
Get-CSServerVersion | Out-Null

If ($Error.Count -ne 0) {
	Write-Host "Script must be run from a Lync/Skype for Business Server" -ForegroundColor Red
	Exit
}

If ($SiteID -eq '') {
	Get-CSSite | Sort-Object SiteID | Where-Object {$_.SiteID -ne 'BackCompatSite'} | FT SiteID, Identity -autosize
	$SiteID = Read-Host "Enter the Site ID to apply the dialing rules for {strLocationName}"
}

$CSSite = Get-CSSite $SiteID -ErrorVariable err

If ($CSSite.Identity -eq $NULL) {
	Write-Host "Invalid Site ID" -ForegroundColor Red
	Exit
}

If ($MediationPool -eq '') {
	# Check for multiple mediation pools in site, and prompt to select
	$MedPool = Get-CSService -MediationServer | Where-Object {$_.SiteID -eq $CSSite.Identity}
	If (($MedPool.Identity -eq $NULL) -and ($MedPool.Count -eq $NULL)) {
		Write-Host
		Write-Host "No mediation pool found in selected site." -ForegroundColor Yellow
		Exit
	}

	If ($MedPool.Count -gt 1) {
		Write-Host
		Write-Host
		Write-Host "ID    Mediation Pool"
		Write-Host "==    =============="
		For ($i=0; $i -lt $MedPool.Count; $i++) {
			$a = $i + 1
			Write-Host ($a, $MedPool[$i].PoolFQDN) -Separator "     "
		}

		$Range = '(1-' + $MedPool.Count + ')'
		Write-Host
		$Select = Read-Host "Multiple entries found. Please select the appropriate entry" $Range
		$Select = $Select - 1
		If (($Select -gt $MedPool.Count-1) -or ($Select -lt 0)) {
			Write-Host "Invalid selection" -ForegroundColor Red
			Exit
		} Else {
			$MedPool = $MedPool[$Select]
		}
	}
} Else {
	$MedPool = Get-CSService MediationServer:$MediationPool
	If (($MedPool.Identity -eq $NULL)) {
		Write-Host
		Write-Host "Could not find MediationServer:$MediationPool in the topology. Check the topology and ensure you typed the name correctly." -ForegroundColor Yellow
		Exit
	}
}

If (($PSTNGateway -eq $NULL) -or ($PSTNGateway -eq '')) {
	$ServerVersion = Get-CSServerVersion
	If ($ServerVersion -like "Microsoft Lync Server 2010*") {
		$PSTNGW = Get-CSService -PSTNGateway | Where-Object {$_.SiteID -eq $CSSite.Identity -and $_.MediationServer -eq $MedPool.Identity}
	} Else {
		$PSTNGW = Get-CSTrunk | Where-Object {$_.SiteID -eq $CSSite.Identity -and $_.MediationServer -eq $MedPool.Identity}
	}

	If (($PSTNGW.Identity -eq $NULL) -and ($PSTNGW.Count -eq 0)) {
		Write-Host
		Write-Host "No PSTN gateway found. You must define a PSTN gateway in your topology and assign it to this pool before running the script." -ForegroundColor Yellow
		Exit
	}

	If ($PSTNGW.Count -gt 1) {
		Write-Host
		Write-Host
		Write-Host "ID    PSTN Gateway"
		Write-Host "==    ============"
		For ($i=0; $i -lt $PSTNGW.Count; $i++) {
			$a = $i + 1
			Write-Host ($a, $PSTNGW[$i].PoolFQDN) -Separator "     "
		}

		$Range = '(1-' + $PSTNGW.Count + ')'
		Write-Host
		$Select = Read-Host "Multiple entries found. Please select the appropriate entry" $Range
		$Select = $Select - 1
		If (($Select -gt $PSTNGW.Count-1) -or ($Select -lt 0)) {
			Write-Host "Invalid selection" -ForegroundColor Red
			Exit
		} Else {
			$PSTNGW = $PSTNGW[$Select]
		}
	}
} Else {
	$ServerVersion = Get-CSServerVersion

	If ($ServerVersion -like "Microsoft Lync Server 2010*") {
		$PSTNGW = Get-CSService PSTNGateway:$PSTNGateway
	} Else {
		$PSTNGW = Get-CSTrunk PSTNGateway:$PSTNGateway
	}

	If (($PSTNGW.Identity -eq $NULL)) {
		Write-Host
		Write-Host "Could not find PSTNGateway:$PSTNGateway in the topology. Check the topology and ensure you typed the name correctly." -ForegroundColor Yellow
		Exit
	}
}

