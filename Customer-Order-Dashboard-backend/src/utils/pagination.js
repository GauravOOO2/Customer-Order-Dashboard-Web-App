// src/utils/pagination.js
const config = require('../config/config');

/**
 * Get pagination options for database queries
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {object} - Skip and limit values
 */
const getPaginationOptions = (page = 1, limit = config.defaultPageSize) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(config.maxPageSize, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  return {
    skip,
    limitNum,
    page: pageNum
  };
};

/**
 * Generate pagination metadata
 * @param {number} totalCount - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} - Pagination metadata
 */
const getPaginationMetadata = (totalCount, page = 1, limit = config.defaultPageSize) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(config.maxPageSize, Math.max(1, parseInt(limit, 10)));
  const totalPages = Math.ceil(totalCount / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  return {
    current_page: pageNum,
    total_pages: totalPages,
    page_size: limitNum,
    total_count: totalCount,
    has_next_page: hasNextPage,
    has_prev_page: hasPrevPage,
    next_page: hasNextPage ? pageNum + 1 : null,
    prev_page: hasPrevPage ? pageNum - 1 : null,
    start_index: totalCount > 0 ? (pageNum - 1) * limitNum + 1 : 0,
    end_index: Math.min(pageNum * limitNum, totalCount)
  };
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} - Validation result
 */
const validatePagination = (page, limit) => {
  const errors = [];
  
  if (page && (!Number.isInteger(+page) || +page < 1)) {
    errors.push('Page must be a positive integer');
  }
  
  if (limit && (!Number.isInteger(+limit) || +limit < 1 || +limit > config.maxPageSize)) {
    errors.push(`Limit must be between 1 and ${config.maxPageSize}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate pagination links for API responses
 * @param {object} req - Express request object
 * @param {object} pagination - Pagination metadata
 * @returns {object} - Pagination links
 */
const generatePaginationLinks = (req, pagination) => {
  const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
  const query = { ...req.query };
  
  const links = {
    self: `${baseUrl}?${new URLSearchParams({ ...query, page: pagination.current_page }).toString()}`,
    first: `${baseUrl}?${new URLSearchParams({ ...query, page: 1 }).toString()}`,
    last: `${baseUrl}?${new URLSearchParams({ ...query, page: pagination.total_pages }).toString()}`
  };
  
  if (pagination.has_prev_page) {
    links.prev = `${baseUrl}?${new URLSearchParams({ ...query, page: pagination.prev_page }).toString()}`;
  }
  
  if (pagination.has_next_page) {
    links.next = `${baseUrl}?${new URLSearchParams({ ...query, page: pagination.next_page }).toString()}`;
  }
  
  return links;
};

module.exports = {
  getPaginationOptions,
  getPaginationMetadata,
  validatePagination,
  generatePaginationLinks
};