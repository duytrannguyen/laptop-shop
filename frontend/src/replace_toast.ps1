$files = Get-ChildItem -Path "e:\Tu_Hoc\laptop-shop\frontend\src" -Recurse -Include *.jsx
foreach ($f in $files) {
  $content = Get-Content $f.FullName -Raw
  if ($content -match 'alert\(') {
    # Replace alert( with showToast(
    $content = $content -replace 'alert\(', 'showToast('
    
    # Check if useToast is imported
    if ($content -notmatch 'import \{ useToast \}') {
      # Count subdirectories to calculate relative path to components
      $rel = ''
      if ($f.DirectoryName -like '*\admin' -or $f.DirectoryName -like '*\user') {
        $rel = '../components/ToastContext'
      } else {
        $rel = './components/ToastContext'
      }
      $content = $content -replace 'import React([^\n]*)\n', "`$0import { useToast } from '$rel';`n"
    }
    
    # Check if showToast is destructured
    if ($content -notmatch 'const \{ showToast \} = useToast\(\)') {
      # Find the component function declaration (export default function X() { )
      $content = $content -replace '(export default function [a-zA-Z0-9_]+\([^)]*\)\s*\{)', "`$1`n  const { showToast } = useToast();"
      $content = $content -replace '(export const [a-zA-Z0-9_]+ = \([^)]*\) =>\s*\{)', "`$1`n  const { showToast } = useToast();"
      $content = $content -replace '(function [a-zA-Z0-9_]+\([^)]*\)\s*\{)', "`$1`n  const { showToast } = useToast();"
    }
    
    Set-Content $f.FullName -Value $content
    Write-Output "Processed $($f.Name)"
  }
}
