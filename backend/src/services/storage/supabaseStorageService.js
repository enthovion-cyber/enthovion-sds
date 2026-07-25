const { supabaseAdmin } = require('../../config/database');
const env = require('../../config/env');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * Uploads a file buffer to Supabase Storage
 * Returns the storage path
 */
const uploadFile = async (buffer, originalName, bucket, folder = '') => {
  const ext = path.extname(originalName).toLowerCase();
  const fileName = `${uuidv4()}${ext}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: getContentType(ext),
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return { path: data.path, fileName, bucket };
};

/**
 * Generates a signed URL for temporary file access (1 hour)
 */
const getSignedUrl = async (filePath, bucket, expiresIn = 3600) => {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);

  if (error) throw new Error(`Failed to generate signed URL: ${error.message}`);
  return data.signedUrl;
};

/**
 * Gets a permanent public URL (only for public buckets)
 */
const getPublicUrl = (filePath, bucket) => {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};

/**
 * Deletes a file from storage
 */
const deleteFile = async (filePath, bucket) => {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([filePath]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
};

const getContentType = (ext) => {
  const types = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.tiff': 'image/tiff',
  };
  return types[ext] || 'application/octet-stream';
};

module.exports = { uploadFile, getSignedUrl, getPublicUrl, deleteFile };
